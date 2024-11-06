// controllers/postController.js
const Post = require('../model/Post')
const { v4: uuid } = require('uuid');


// Create Post
const createPost = async (req, res) => {

    const file = req.files
    const path = file.map(val => val?.path)

    const user = req.user
    const { content} = req.body;

    if(!content ) return res.sendStatus(400);
    await Post.create(
        {
            user : user,
            content : content,
            path : path,
        }
    )
  return res.sendStatus(200)
}
// Get All Posts
const getAllPosts = async (req, res) => {
  const data = await Post.find()
  res.json(data)
};

// Like a Post
const likePost = async (req, res) => {
    const {id , like} = req.body;

    try {
        const post = await Post.findById(id)
        if(!post) return res.sendStatus(404)

        post.like = post.like + like;
        post.save();
        res.sendStatus(200)
    } catch (err) {
        console.log(err + " ; likePost")
        res.status(500).json(err)
    }
    
};

// Comment on a Post
const commentOnPost = async (req, res) => {

    const files = req.files
    const images = files.map(val => val?.path)
    const { id , content } = req.body;
    const user = req.user
    
    if(!id || !content) return res.sendStatus(400);

    try {
        const post = await Post.findById(id)
        if(!post) return res.sendStatus(404);

        await Post.create({
            user : user,
            content : content,
            reply : id,
            images : images,
        });

        return res.sendStatus(200);

    } catch (err) {
        console.log(err + " ; commentOnpost")
        return res.status(500).json(err)
    }
};

const getComment = async (req, res) => {
    const {id} = req.body;

    try {
        const post = await Post.findAll({reply : id}).exec();
        if(!post || !post.reply) return res.sendStatus(404);

        return res.json(post);
    } catch (err) {
        console.log(err + " ; getComment")
        return res.status(500).json(err)
    }
}

module.exports =  {createPost , getAllPosts , commentOnPost , likePost , getComment}
