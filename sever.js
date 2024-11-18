require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvent');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

// Google Cloud Storage configuration
const storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to your service account JSON file
});
const bucketName = process.env.GCS_BUCKET_NAME; // Set your bucket name in .env

// Multer configuration for handling file uploads
const multerStorage = multer.memoryStorage(); // Store files in memory before uploading to Google Cloud
const upload = multer({ storage: multerStorage });

// Connect to MongoDB
connectDB();

// Custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for JSON
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve static files
app.use('/pubilc', express.static(path.join(__dirname, '/pubilc')));

// File upload route
app.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const uniqueFileName = `${req.user || 'guest'}/${uuidv4()}${path.extname(file.originalname)}`;
        const bucket = storage.bucket(bucketName);
        const blob = bucket.file(uniqueFileName);

        // Stream the file to Google Cloud Storage
        const stream = blob.createWriteStream({
            resumable: true,
            contentType: file.mimetype,
        });

        stream.on('error', (err) => {
            console.error('Error uploading file:', err);
            next(err);
        });

        stream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFileName}`;
            res.status(200).json({ message: 'File uploaded successfully', fileUrl: publicUrl });
        });

        stream.end(file.buffer);
    } catch (err) {
        next(err);
    }
});

// Routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logOut'));

app.use(verifyJWT);
app.use('/note', require('./routes/api/noteApi'));
app.use('/location', require('./routes/api/locaApi'));
app.use('/user', require('./routes/api/userApi'));
app.use('/how', require('./routes/api/howApi'));
app.use('/post', require('./routes/api/postApi'));

// 404 handler
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

// Error handling middleware
app.use(errorHandler);

// Start server after connecting to MongoDB
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
