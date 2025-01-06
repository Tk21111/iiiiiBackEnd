const User = require('../model/User');
const Post = require('../model/Post');


const updateProfile = async (req,res) => {

    //image files
    try{
        
        const user = await User.findOne({ username: req.user }).exec();
        if(req.body.username){
            user.aka = req.body.username
        }
        if(req.body.fileInfo){
            //modify paths to the path
          
            user.image = req.body.fileInfo
        }
        if(req.body.more){
            //more 
            user.more = req.body.more
        }
        
        await user.save();
        return res.status(200).json({ message : 'userProfile have been update'})
    } catch (err) {
        console.log( err + '; updateProfile')
        return res.json(err)
    }
    
};

//@ userId || usernaem
const getUser = async (req,res) => {


    try {
        const {userId , username} = req.body;

        let user;

        if(username){
            user = await User.findOne({username : username}).select('-password -roles').exec()
        } else if (userId) {
             user = await User.findById(userId)
            .select('-password -roles')
            .exec(); 
        }

        if(!user) return res.sendStatus(404);
    
        return res.json(user);
    } catch (err) {
        console.log(err + " ; getUser")
        res.status(500).json({"message" : err})
    }   
}

const getOrg = async (req , res) => {

    try {
        let user = await User.find()
        const userOrg = user.filter(obj => obj.roles.includes("org"))
        res.json(userOrg)

    } catch (err) {
    
        res.status(500).json({"message" : err + "getOrg"})
    }
};

const setNoti = async (req, res) => {
    const { noti } = req.body;

    if (!noti) return res.status(400).json({ "message": "Bad request: missing 'noti'." });

    try {
        // Find the user using req.user
        const foundUser = await User.findOne({ username: req.user }).exec();
        if (!foundUser) return res.status(401).json({ "message": "User not found." });

        // Initialize Tmp as an empty array if noti doesn't exist
        let Tmp = foundUser.noti && Array.isArray(foundUser.noti) ? foundUser.noti : [];

        // Keep the array to a maximum length of 30
        if (Tmp.length > 30) {
            Tmp.pop();
        }

        // Add the new notification
        Tmp.push(noti);

        // Assign the updated array back to the user
        foundUser.noti = Tmp;

        
        // Save the user with the updated notifications
        await foundUser.save();

        // Send success response
        res.sendStatus(200);
    } catch (err) {
        console.error("Error in setNoti:", err);
        res.sendStatus(500);
    }
};


const getNoti = async (req, res) => {
    try {
        // Find the user using req.user
        const foundUser = await User.findOne({ username: req.user }).exec();
        if (!foundUser) return res.status(401).json({ "message": "User not found." });

        // Return the notifications or an empty array if they are undefined
        const notifications = foundUser.noti || [];
        res.json(notifications);
        
    } catch (err) {
        console.error("Error in getNoti:", err);
        res.status(500).json({ "message": "Server error." });
    }
};



module.exports = {updateProfile ,getUser , getOrg , setNoti , getNoti}