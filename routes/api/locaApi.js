const express = require('express');
const router = express.Router();
const LocaController = require('../../controller/Hloca');
const verifyRoles = require('../../middleware/verifyRoles');
const multer = require('multer');
const path = require('path');
const {pathChecker , nameChecker} =  require('./pathFindder');
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
    const ext = path.extname(file.originalname);
    const uniqueName = `${userId}/${uuidv4()}${ext}`;
    const blob = bucket.file(uniqueName);

    const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', async () => {
           
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
            resolve({ uniqueName, publicUrl });
        });
        blobStream.end(file.buffer);
    });
};


router.route('/')
    .get( LocaController.HgetallUserLoca)
router.route('/all')
    .get( LocaController.HgetallLoca);
router.route('/create')
    .post(upload.array('images'), async (req, res, next) => {
        try {
            const userId = req.user; // Assuming `req.user` contains user ID or identifier
            const filePromises = req.files.map(file => uploadToGCS(file, userId));
            const uploadedFiles = await Promise.all(filePromises);

            // Save file information back to req
            req.body.fileInfo = uploadedFiles.map(({ uniqueName, publicUrl }) => ({
                fileName: uniqueName,
                url: publicUrl,
            }));

            // Pass to the controller
            LocaController.HcreateLoca(req, res, next);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
router.route('/donate')
    .post( LocaController.Hdonate);
router.route('/update')
    .patch(LocaController.HupdateLoca);
router.route('/delete')
    .delete(LocaController.HdeleteLoca);

module.exports = router;