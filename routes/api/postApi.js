// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../../controller/Hpost");
const multer = require("multer");


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
router.route("/post/like")
    .post(postController.likePost);
router.route("/post/comments")
    .post(postController.commentOnPost);
router.route("/post/comments")
    .patch(postController.getComment);

module.exports = router;
