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
        const images =  file.map(val => val.path)
        if(!content ) return res.sendStatus(400);
        const userId = await User.findOne({username : user}).exec();
        if(!userId) return res.sendStatus(401)
        await Post.create(
                {
                    user : userId,
                    content : content,
                    images : images || [],
                }
        )
        return res.status(200).json({"msg" : "ok"})
    } catch (err) {
        console.log( err + " ; createPost")
        return res.json(err)
    }
    
}
// Get All Posts
const getAllPosts = async (req, res) => {
    //automatic search for user in user because user is a obj 
    const data = await Post.find().populate('user');



  res.json(data)
};

// Like a Post
//id = {postid : bool}
const likePost = async (req, res) => {
    const { id } = req.body;

    console.log(id)
    try {
        if (!id) return res.sendStatus(400);

        // Find the user making the request
        const user = await User.findOne({ username: req.user }).exec();
        if (!user) return res.sendStatus(401);

        const bool = Object.values(id)[0];
        const key = Object.keys(id)[0];

        // Fetch posts from the database
        const posts = await Post.find();
        
        const  postUpdate = posts.find(val => val._id.toString() === key.toString());
        if(!postUpdate) return res.sendStatus(404)
    
        //check for instuction
        if(bool){
            postUpdate.like = [...postUpdate.like , user.username ];
            await postUpdate.save()
        } else {
            postUpdate.unlike = [...postUpdate.unlike , user.username ];
            await postUpdate.save()
        }

        console.log(postUpdate)

        res.status(200).json({"msg" : "ok"});
    } catch (err) {
        console.error(err + " ; likePost");
        res.status(500).json(err);
    }
};

// Comment on a Post
const commentOnPost = async (req, res) => {


    const files = req?.files
    const images = files?.map(val => val?.path)
    const { id , content } = req.body;
    const user = req.user

    
    if(!id || !content) return res.sendStatus(400);

    try {
        const userId = await User.findOne({username : user}).exec();
        if(!userId) return res.sendStatus(401)
        const post = await Post.findById(id)
        console.log(!post)
        if(!post) {return res.sendStatus(404); console.log('not found post')}

        await Post.create({
            user : userId,
            content : content,
            reply : id,
            images : images,
        });

        console.log('succes')
        return res.status(200).json({"msg" : "ok"});

    } catch (err) {
        console.log(err + " ; commentOnpost")
        return res.status(500).json(err)
    }
};

const getComment = async (req, res) => {
    const {id} = req.body;

    try {
        const post = await Post.find({reply : id}).populate('user');
        if(!post) return res.sendStatus(404);

        return res.json(post);
    } catch (err) {
        console.log(err + " ; getComment")
        return res.status(500).json(err)
    }
}

module.exports =  {createPost , getAllPosts , commentOnPost , likePost , getComment}
