const User = require('../model/User');

const updateProfile = async (req,res) => {
    //image files
    try{
        let paths = req.files;
        const user = await User.findOne({ username: req.user }).exec();
        if(req.body.username){
            user.aka = req.body.username
        }
        if(paths){
            //modify paths to the path
            paths = paths.map(path => path.path)
            user.image = paths
        }
        if(req.body.more){
            //more 
            user.more = req.body.more
        }
        
        await user.save();
        res.status(200).json({ message : 'userProfile have been update'})
    } catch{
        console.log('somethung fucj')
    }
    
};

const getUser = async (req,res) => {
    const user = await User.findOne({username : req.user}).exec();
    if(!user){
        res.sendStatus(404);
    }
    res.json(user);
}
module.exports = {updateProfile ,getUser}