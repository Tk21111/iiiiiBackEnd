// controllers/postController.js
const Post = require('../model/Post')
const User = require('../model/User')
const { v4: uuid } = require('uuid');


// Create Post
const createPost = async (req, res) => {

    const file = req.files
    const path = file?.map(val => val?.path)
    const user = req.user

    let {content} = req.body;
    
    try {
        if(!content ) return res.sendStatus(400);
        const userId = await User.findOne({username : user}).exec();
        if(!userId) return res.sendStatus(401)
        await Post.create(
                {
                    user : userId,
                    content : content,
                    path : path || [],
                }
        )
        console.log('done')
        return res.status(200).json({"msg" : "ok"})
    } catch (err) {
        console.log( err + " ; createPost")
        return res.json(err)
    }
    
}
// Get All Posts
const getAllPosts = async (req, res) => {
  const data = await Post.find()
  res.json(data)
};

// Like a Post
//id = {postid : bool}
const likePost = async (req, res) => {
    const {id} = req.body;

    try {

        if(!id ) return res.sendStatus(400);
        
        const user = await User.findOne({username : req.user}).exec();

        if(!user) return res.sendStatus(401);
        
        const post = await Post.find();

        const postUpdate = post.map(val => { key.Object(id).includes(val?._id) ? id[val?._id] ? val.like = [...val.like , user?._id] : val.unlike = [...val.unlike , user?._id ]
        : val}

        await post.save();
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
        const userId = await User.findOne({username : user}).exec();
        if(!userId) return res.sendStatus(401)
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
