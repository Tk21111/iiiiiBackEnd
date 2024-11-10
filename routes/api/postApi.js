// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../../controller/Hpost");
const multer = require("multer");
const { pathChecker } = require("./pathFindder");
const path = require('path');
const { v4: uuidv4 } = require('uuid');


const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        await pathChecker(req , file);
        
        cb(null, `pubilc/image/${req.user}`); // specify the folder where the files should be saved
    },
    filename: async function (req, file, cb) {
        const ext = path.extname(file.originalname);  // Get the file extension
        const uniqueName = `${uuidv4()}${ext}`;  // Create a unique name using UUID and original extension
        cb(null, uniqueName);  // Save the file with the new name
    }
});

const upload = multer({ storage: storage });

router.route("/")
    .post(upload.array('images') ,postController.createPost);
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
