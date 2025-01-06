const Note = require('../model/Note');
const User = require('../model/User');
const Loca = require('../model/Loca');

const fs = require('fs');
const { count } = require('console');

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

//@ username, food , town , subdistrict , county , more
//@post
const HcreateLoca = async (req, res) => {
    const name = req.user;
    const { food, district, subdistrict, country, more ,num , province , longitude , latitude} = req.body;

    
    //multer 
    const images = req.files;

    if (!name || !food || !district || !subdistrict || !country || !num || !province ||!latitude || !longitude) {
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

        

        const loca = await Loca.create({ 
            food, 
            user: foundUser._id, 
            subdistrict, 
            country,
            district,
            province,
            more,
            latitude,
            longitude,
            images: req.body?.fileInfo || null, 
            organisation: role , 
            num });
        return res.status(201).json({ message: 'Created', loca });
    } catch (error) {
        console.error("Error creating loca:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


//@get 
const HgetallLoca = async (req, res) => {
    try {let loca = await Loca.find().select('-__v -getP').populate('user').populate('food')

    loca = loca.filter(obj => (!obj.getPId))
    // If no notes 
    if (!loca?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    return res.json(loca)
    } catch (err) {
        console.log(err + " ; HgetallLoca")
        return res.json(err)
    }
   
};

//@ req.user
//@get
const HgetallUserLoca = async (req, res) => {
    const name = req.user;
    if (!name) return res.status(400).json({ message: 'Missing required fields' });

    try {
        const user = await User.findOne({ username: name }).select('-__v').exec();
        if (!user) return res.status(404).json({ message: 'User not found' });

        let result = await Loca.find({ user: user._id })
        .populate({ 
            path: 'user', 
            select: '-password -noti -roles -postsave' // Exclude sensitive fields 
        })
        .populate({
            path: 'getPId',
            select: '-password -noti -roles -postsave' // Exclude sensitive fields
        })
        .populate('food') // If no sensitive fields, regular populate works
        .lean(); // Convert to plain objects for easier manipulation


        result = result.map((val) => {return { ...val , own : true }})
        let userGetResult = await Loca.find({getPId : user._id}).populate({ 
            path: 'user', 
            select: '-password -noti -roles -postsave ' // Exclude sensitive fields 
        })
        .populate({
            path: 'getPId',
            select: '-password -noti -roles -postsave' // Exclude sensitive fields
        })
        .populate('food') // If no sensitive fields, regular populate works
        .lean(); // Convert to plain objects for easier manipulation
        userGetResult = userGetResult.map((val) => {return { ...val, own : false }}) // Convert Mongoose doc to plain object and add `own`

        res.json(result.concat(userGetResult));
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

    const {id} = req.body;
  
    if (!id) {
        return res.status(401).json({message : 'bad request'});
    }
    const deleteLoca = await Loca.findById(id).exec();

    const foundUser = await User.findOne({username : req.user }).exec();
    if (!deleteLoca.user.equals(foundUser._id)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
   
    

    if (!deleteLoca) return res.status(404).json({message : 'note is not found'});

    if (deleteLoca.images) {
            const deleteResults = await Promise.all(
                deleteLoca.images.map(async (info) => {
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

    const result = await deleteLoca.deleteOne()
    res.json({message : id + 'note deleted'})

};

const Hdonate = async (req , res) => {
    const reqUser = req.user


    let loca = await Loca.findById({_id : req.body.id}).exec();
    let user = await User.findOne({username: reqUser}).exec();

    if(!loca){
        return res.sendStatus(404);

    } else if (loca.getPId){
        return res.sendStatus(403);   
    } else {

        loca.getPId = user._id
        loca.save();

        return res.status(200).json({"message": "good"});
    }
    
};




module.exports = { HcreateLoca , HgetallLoca , HdeleteLoca , HgetallUserLoca , HupdateLoca , Hdonate};