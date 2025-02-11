const express = require('express');
const router = express.Router();
const HowController = require('../../controller/Hhow');
const verifyRoles = require('../../middleware/verifyRoles');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Storage } = require('@google-cloud/storage');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Google Cloud Storage configuration
const storage = new Storage({credentials // Path to your service account key file
});

const bucketName = 'back-iiiii-img'; // Replace with your Cloud Storage bucket name
const bucket = storage.bucket(bucketName);

// Multer storage setup for Google Cloud
const multerStorage = multer.memoryStorage();

const upload = multer({ storage: multerStorage });

const uploadToGCS = async (file, userId) => {
    if (!file || !file.originalname) {
        throw new Error("Invalid file provided");
    }

    const ext = path.extname(file.originalname);
    const uniqueName = `${userId}/${uuidv4()}${ext}`;
    const blob = bucket.file(uniqueName);

    console.log(`Uploading: ${uniqueName}, MIME: ${file.mimetype}`);

    return new Promise((resolve, reject) => {
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
        });

        blobStream.on('error', (err) => {
            console.error("GCS Upload Error:", err);
            reject(err);
        });

        blobStream.on('finish', async () => {
            try {
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
                resolve({ uniqueName, publicUrl });
            } catch (err) {
                reject(new Error("Failed to make file public: " + err.message));
            }
        });

        blobStream.end(file.buffer);
    });
};


router.route('/create')
    .post(upload.array('images'), async (req, res, next) => {
        try {
            //console.log(req)
            const userId = req.user; // Assuming `req.user` contains user ID or identifier
            const filePromises = req.files.map(file => uploadToGCS(file, userId));
            const uploadedFiles = await Promise.all(filePromises);

            console.log("req")
            // Save file information back to req
            req.body.fileInfo = uploadedFiles.map(({ uniqueName, publicUrl }) => ({
                fileName: uniqueName,
                url: publicUrl,
            }));

            // Pass to the controller
            HowController.Hsethow(req, res, next);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });


router.route('/')
    .get(HowController.Hgethow);

router.route('/update')
    .patch(HowController.Hupdatehow);

router.route('/')
    .delete(HowController.HdelHow);

module.exports = router;
