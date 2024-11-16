const Post = require('../model/Post');
const User = require('../model/User');
const Note = require('../model/Note');
const How = require('../model/How');
const Loca = require('../model/Loca');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

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
        //if food : null still working //nice
        const data = await Post.find()
            .populate('user')
            .populate('food')
            .populate('loca')
            .populate({
                path: 'loca',
                populate: [
                    {
                        path: 'user',
                        select: '-password -roles -noti -postsave'
                    },
                    {
                        path: 'getPId',
                        select: '-password -roles -noti -postsave'
                    },
                    {
                        path : 'food'
                    }
                        
                ]
            })
            .populate('how');

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
            // Check if the user has already liked the post
            if (postUpdate.like.includes(req.user)) {
                // Remove the user from the like list
                postUpdate.like = postUpdate.like.filter(val => val !== req.user);
            } else {
                // Add the user to the like list
                postUpdate.like = [...postUpdate.like, user.username];
                // Ensure user is not in the unlike list
                postUpdate.unlike = postUpdate.unlike.filter(val => val !== req.user);
            }
        } else {
            // Check if the user has already unliked the post
            if (postUpdate.unlike.includes(req.user)) {
                // Remove the user from the unlike list
                postUpdate.unlike = postUpdate.unlike.filter(val => val !== req.user);
            } else {
                // Add the user to the unlike list
                postUpdate.unlike = [...postUpdate.unlike, user.username];
                // Ensure user is not in the like list
                postUpdate.like = postUpdate.like.filter(val => val !== req.user);
            }
        }
        
        // Save the post update after modification
        await postUpdate.save();

        res.status(200).json({ msg: "Post updated successfully" });
    } catch (err) {
        console.error(err + " ; likePost");
        res.status(500).json({ error: "Failed to update post" });
    }
};

const SavePost = async (req, res) => {
    const { id } = req.body;
    if (!id) return res.sendStatus(400);

    try {
        // Fetch user and post using `await`
        const user = await User.findOne({ username: req.user }).exec();
        if (!user) return res.sendStatus(401);

        const post = await Post.findById(id).exec();
        if (!post) return res.sendStatus(404);

        // Avoid adding duplicate posts
        if (!user?.postsave?.includes(id)) {
            console.log('no')
            user.postsave = [...user.postsave, id];
            await user.save();
        } else {
            console.log('yes')
            //postsave haven't populate yet so it only have id
            user.postsave = user.postsave.filter(val => val.toString() !== id);
            await user.save();
        }

        return res.json({ "msg": "ok" });
    } catch (err) {
        console.error(err + "  ; SavePost");
        return res.status(500).json({ "error": err.message });
    }
};


const getSavePost = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ error: "User is not authenticated" });
        }

        // Find the user and populate the saved posts
        const post = await User.findOne({ username: req.user })
        .populate('postsave')
        .populate({
            path: 'postsave',
            populate: {
                path: 'user'
            }
        });
    
        // Check if user exists
        if (!post) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(post.postsave); // Return the populated user document
    } catch (err) {
        console.error(err + " ; getSavePost");
        return res.status(500).json({ error: "An error occurred while fetching posts" });
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

    const {id } = req.body
    const user = req.user;

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
    const resultReply = await Post.deleteMany({ reply : id })
   

    return res.json(result);

    } catch (err) {
        console.log(err + " ; delPost")
        return res.json(err)
    }
}

module.exports = { createPost, getAllPosts, commentOnPost, likePost, getComment , HdelPost , SavePost , getSavePost};
