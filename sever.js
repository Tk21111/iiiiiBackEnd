require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvent');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const http = require('http'); // Import HTTP server
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const PORT = 3500;

// Connect to MongoDB
connectDB();

// Custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross-Origin Resource Sharing
app.use(cors(corsOptions));

// Built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for JSON 
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve static files
app.use('/public', express.static(path.join(__dirname, '/public')));

// Routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logOut'));

// Protected routes
app.use(verifyJWT);
app.use('/note', require('./routes/api/noteApi'));
app.use('/location', require('./routes/api/locaApi'));
app.use('/user', require('./routes/api/userApi'));
app.use('/how', require('./routes/api/howApi'));
app.use('/post', require('./routes/api/postApi'));

// Create HTTP server and pass in the Express app
const server = http.createServer(app);

// Set up the WebSocket server on top of the HTTP server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
const clients = new Map();

wss.on('connection', (ws , req) => {

    const token = req.url.split('?token=')[1];
    if (!token) return ws.close();

   try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Store connection in clients map by user ID
        clients.set(userId, ws);

        ws.on('close', () => {
            clients.delete(userId);
        });
    } catch (error) {
        ws.close();
    }
});

// Function to send notifications to all connected clients
const sendNotification = (userId , notification) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
    }
};

// Simulate sending a notification every 10 seconds
setInterval(() => {
    sendNotification('This is a test notification');
}, 100);

// 404 Handling for unknown routes
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

// Error handler middleware
app.use(errorHandler);

// Start server once MongoDB connection is open
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
