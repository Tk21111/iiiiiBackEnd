const User = require('../model/User');

const updateProfile = async (req,res) => {

    console.log(req.body)
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

  

    try {
        if(req?.body?.userId === "undefined"){
            res.status(400).json({"message" : "bad requset"})
        } else{
            const user = await User.findById(req.body.userId)
        .select('-password -roles')
        .exec();
          if(!user){
            res.sendStatus(404);
        }else{
            res.json(user);
        }
        
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({"message" : err})
    }
    
    
}
module.exports = {updateProfile ,getUser}