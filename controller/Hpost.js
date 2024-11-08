const Post = require('../model/Post');
const User = require('../model/User');
const Note = require('../model/Note');
const How = require('../model/How');
const Loca = require('../model/Loca');
const { v4: uuid } = require('uuid');

// Create Post
//@ content , title //@ not require loca , food , how 
const createPost = async (req, res) => {
    const file = req.files;
    const images = file?.map(val => val?.path) || [];
    const user = req.user;
    const { food, loca, how, content, title , locaOwner} = req.body;

    if (!content || !title) return res.sendStatus(400);

    try {
        const userId = await User.findOne({ username: user }).exec();
        if (!userId) return res.sendStatus(401);

        let postData = { user: userId, content, title, images };

        // Populate `food`, `loca`, or `how` fields based on availability
        if (food) {
            const foodId = await Note.findById(food);
            if (!foodId) return res.status(404).json({ msg: "cannot find food" });
            postData.food = foodId;
        } else if (loca && locaOwner) {
            const locaId = await Loca.findById(loca).populate('getPId');

            if (!locaId) return res.status(404).json({ msg: "cannot find loca" });
            console.log(userId)
            console.log(locaId)
            postData.loca = locaId;
            postData.userlist = [userId.username, locaOwner];
        } else if (how) {
            const howId = await How.findById(how);
            if (!howId) return res.status(404).json({ msg: "cannot find how" });
            postData.how = howId;
        }

        await Post.create(postData);
        console.log(`Successfully created post with ${food ? "food" : loca ? "loca" : how ? "how" : "default"}`);
        return res.status(200).json({ msg: "Post created successfully" });
    } catch (err) {
        console.error(err + " ; createPost");
        return res.status(500).json({ error: "Unable to create post. Please try again later." });
    }
};

// Get All Posts
const getAllPosts = async (req, res) => {
    try {
        //if food : null still working nice
        const data = await Post.find().populate('user').populate('food').populate('loca').populate('how');
        res.json(data);
    } catch (err) {
        console.error(err + " ; getAllPosts");
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

// Like a Post
const likePost = async (req, res) => {
    const { id } = req.body;

    if (!id) return res.sendStatus(400);

    try {
        const user = await User.findOne({ username: req.user }).exec();
        if (!user) return res.sendStatus(401);

        const bool = Object.values(id)[0];
        const key = Object.keys(id)[0];

        const postUpdate = await Post.findById(key);
        if (!postUpdate) return res.sendStatus(404);

        if (bool) {
            postUpdate.like = [...postUpdate.like, user.username];
        } else {
            postUpdate.unlike = [...postUpdate.unlike, user.username];
        }
        await postUpdate.save();

        res.status(200).json({ msg: "Post updated successfully" });
    } catch (err) {
        console.error(err + " ; likePost");
        res.status(500).json({ error: "Failed to update post" });
    }
};

// Comment on a Post
const commentOnPost = async (req, res) => {
    const files = req?.files;
    const images = files?.map(val => val?.path) || [];
    const { id, content } = req.body;
    const user = req.user;

    if (!id || !content) return res.sendStatus(400);

    try {
        const userId = await User.findOne({ username: user }).exec();
        if (!userId) return res.sendStatus(401);

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        await Post.create({
            user: userId,
            content,
            reply: id,
            images,
        });

        res.status(200).json({ msg: "Comment added successfully" });
    } catch (err) {
        console.error(err + " ; commentOnPost");
        res.status(500).json({ error: "Failed to add comment" });
    }
};

// Get Comments for a Post
const getComment = async (req, res) => {
    const { id } = req.body;

    try {
        const comments = await Post.find({ reply: id }).populate('user');
        if (!comments) return res.status(404).json({ msg: "No comments found" });

        res.json(comments);
    } catch (err) {
        console.error(err + " ; getComment");
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};

const HdelPost = async (req, res) =>  {

    const {id , user} = req.id

    if(!id || !user) return res.sendStatus(400);

    try {
        const post = await  Post.findById(id).populate('user');

        if(post.user.username !== user){
            return res.sendStatus(401);
        }

        if(!post) return res.sendStatus(404);

        post.images.forEach( p => {
            fs.unlink(p, (err) => {
                if (err) {
                  // An error occurred while deleting the file
                  if (err.code === 'ENOENT') {
                    // The file does not exist
                    console.error('The file does not exist');
                  } else {
                    // Some other error
                    console.error(err.message);
                  }
                } else {
                  // The file was deleted successfully
                  console.log('The file was deleted');
                }
              });
        });

    const result = await post.deleteOne()

    return res.json(result);

    } catch (err) {
        console.log(err + " ; delPost")
        return res.json(err)
    }
}

module.exports = { createPost, getAllPosts, commentOnPost, likePost, getComment , HdelPost };
