const Note = require('../model/Note');
const User = require('../model/User');
const Loca = require('../model/Loca');

const fs = require('fs');
const { count } = require('console');
//@ username, food , town , subdistrict , county , more
//@post
const HcreateLoca = async (req, res) => {
    const name = req.user;
    const { food, town, subdistrict, county, more ,num } = req.body;

    
    //multer 
    const images = req.files;

    if (!name || !food || !town || !subdistrict || !county || !num) {
        console.log("Missing required fields");
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        //update note for count of food left
        const note = await Note.findById(food);
        const left = note.count - num 
        console.log(note)
        if (left >=0){
            note.count = left
            note.save();
        };
        const foundUser = await User.findOne({ username: name }).lean().exec();
        if (!foundUser) {
            console.log("User not found");
            return res.status(401).json({ message: 'User not found' });
        };
        let role;
        for(let i of foundUser.roles){
            if (i === 'org'){
                role = true;
            }
        };
        // Save image paths to the database
        const imagePaths = images.map(file => file.path);
        console.log(imagePaths)

        const loca = await Loca.create({ food, town, user: foundUser._id, subdistrict, county, more, images: imagePaths , organisation: role , num });
        return res.status(201).json({ message: 'Created', loca });
    } catch (error) {
        console.error("Error creating loca:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


//@get 
const HgetallLoca = async (req, res) => {
    let loca = await Loca.find().select('-__v -getP').lean()

    loca = loca.filter(obj => (!obj.getP && !obj.getPId))
    // If no notes 
    if (!loca?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(loca.map(async (loca) => {
        const note = await Note.findById(loca.food).lean().exec()
        const user = await User.findById(loca.user).lean().exec()
        return { 
            ...loca, 
            text: note?.text ,
            userName : user?.username,
            aka : user?.aka ,
            imageUser : user?.image ,
            exp : note?.timeOut ,
            tag : note?.tag}
    }))
    res.json(notesWithUser)    
};

//@ req.user
//@get
const HgetallUserLoca = async (req, res) => {
    const name = req.user;
    if (!name) return res.status(400).json({ message: 'Missing required fields' });

    try {
        const user = await User.findOne({ username: name }).select('-__v').exec();
        if (!user) return res.status(404).json({ message: 'User not found' });

        let result = await Loca.find({ user: user._id }).lean().exec();

        result = await Promise.all(result.map(async (loca) => {
            const note = await Note.findById(loca.food).lean().exec();
            return {
                ...loca,
                text: note?.text,
                userName : user?.username,
                tag: note?.tag,
                exp : note?.timeOut,
            };
        }));
        res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//@patch


const HupdateLoca = async (req , res ) => {
    const name = req.user;
    const { id, food, town, subdistrict, county, more } = req.body;

    if (!id) {
        console.log("Missing required fields");
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const foundLoca = await Loca.findById(id)
    if (!foundLoca) return res.status(404).json({ message : "Didn't find note"});
    foundLoca.town = town
    foundLoca.subdistrict = subdistrict
    foundLoca.county = county
    foundLoca.more = more
    foundLoca.save();

    res.status(200).json({ message : 'note have been update'})

}

//@ loca_id , username of loca
//@delete
const HdeleteLoca = async (req , res) => {

    const {id , user} = req.body;
    if (!id) {
        return res.status(401).json({message : 'bad request'});
    }
    const deleteLoca = await Loca.findById(id).exec();

    const foundUser = await User.findOne({username : user }).exec();
    if (!deleteLoca.user.equals(foundUser._id)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
   
    //from https://byby.dev/node-delete-file
    //delete image
    deleteLoca.images.forEach( p => {
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
    

    if (!deleteLoca) return res.status(404).json({message : 'note is not found'});

    const result = await deleteLoca.deleteOne()
    res.json({message : id + 'note deleted'})

};

const Hdonate = async (req , res) => {
    const reqUser = req.user

    console.log(reqUser)

    let loca = await Loca.findById({_id : req.body.id}).exec();
    let user = await User.findOne({username: reqUser}).exec();
    if(!loca){
        res.sendStatus(404);
    } else {
        loca.getP =  reqUser;
        loca.getPId = user._id
        loca.save();

        res.status(200).json({"message": "good"});
    }
    
};




module.exports = { HcreateLoca , HgetallLoca , HdeleteLoca , HgetallUserLoca , HupdateLoca , Hdonate};