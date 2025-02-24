// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../../controller/Hpost");
const multer = require("multer");
const { pathChecker } = require("./pathFindder");
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
            postController.createPost(req, res, next);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
router.route("/")
    .get(postController.getAllPosts);
router.route("/")
    .patch(postController.likePost);
router.route("/save")
    .patch(postController.SavePost);
router.route("/save")
    .get(postController.getSavePost);
router.route("/comment")
    .post(upload.array('images') ,postController.commentOnPost);
router.route("/comment")
    .patch(postController.getComment);
router.route("/")
    .delete(postController.HdelPost)

module.exports = router;
