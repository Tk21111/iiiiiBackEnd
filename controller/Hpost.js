const Post = require('../model/Post');
const User = require('../model/User');
const Note = require('../model/Note');
const How = require('../model/How');
const Loca = require('../model/Loca');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: 'back-iiiii', // Replace with your Google Cloud Project ID
    keyFilename: 'back-iiiii-3f4f26c39c9e.json' // Path to your service account key file
});
const bucketName = 'back-iiiii-img';

const deleteFromGCS = async (fileName) => {
    try {
        const file = storage.bucket(bucketName).file(fileName);
        await file.delete();
        console.log(`File ${fileName} deleted successfully.`);
        return { success: true, message: `File ${fileName} deleted successfully.` };
    } catch (error) {
        console.error(`Failed to delete file ${fileName}:`, error);
        return { success: false, message: `Failed to delete file ${fileName}: ${error.message}` };
    }
};


// Create Post
//@ content , title //@ not require loca , food , how 
const createPost = async (req, res) => {

    const user = req.user;
    const { food, loca, how, content, title , locaOwner} = req.body;

    if (!content || !title) return res.sendStatus(400);

    try {
        const userId = await User.findOne({ username: user }).exec();
        if (!userId) return res.sendStatus(401);

        let postData = { user: userId, content, title, images : req.body.fileInfo };

        // Populate `food`, `loca`, or `how` fields based on availability
        let locaId
        if (food) {
            const foodId = await Note.findById(food);
            if (!foodId) return res.status(404).json({ msg: "cannot find food" });
            postData.food = foodId;
        } else if (loca && locaOwner) {
            locaId = await Loca.findById(loca).populate('getPId');

            if (!locaId) return res.status(404).json({ msg: "cannot find loca" });
            postData.loca = locaId;
            postData.userlist = [userId.username, locaOwner];
        } else if (how) {
            const howId = await How.findById(how);
            if (!howId) return res.status(404).json({ msg: "cannot find how" });
            postData.how = howId;
        }

        const success = await Post.create(postData);
        if(loca && locaOwner){
            locaId.post = success._id
            locaId.save();
            console.log("post save")
        }
        console.log(`Successfully created post with ${food ? "food" : loca ? "loca" : how ? "how" : "default"}`);
        return res.status(200).json(success);
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
        .populate({
            path: 'user',
            select : '-password -roles -noti -postsave'
        })
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

            user.postsave = [...user.postsave, id];
            await user.save();
        } else {

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

        return res.status(200).json({ msg: "Comment added successfully" });
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

        if (post.images) {
            const deleteResults = await Promise.all(
                post.images.map(async (info) => {
                    try {
                        const result = await deleteFromGCS(info.fileName);
                        return result.success; // Return whether deletion was successful
                    } catch (err) {
                        console.error(`Error deleting file ${info.fileName}:`, err);
                        return false; // Return false if deletion fails
                    }
                })
            );

            // Check if all deletions succeeded
            if (!deleteResults.every((result) => result)) {
                return res.status(500).json({ message: "Failed to delete all images" });
            }
        }


    
    const result = await post.deleteOne()
    const resultReply = await Post.deleteMany({ reply : id })
   

    return res.json(result);

    } catch (err) {
        console.log(err + " ; delPost")
        return res.json(err)
    }
}

module.exports = { createPost, getAllPosts, commentOnPost, likePost, getComment , HdelPost , SavePost , getSavePost};
