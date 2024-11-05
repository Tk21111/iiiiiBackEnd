// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../../controller/Hpost");

router.post("/", postController.createPost);
router.get("/", postController.getAllPosts);
router.post("/post/like", postController.likePost);
router.post("/post/comments", postController.commentOnPost);
router.patch("/post/comments", postController.getComment);

module.exports = router;
