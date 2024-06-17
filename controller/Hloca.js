const Note = require('../model/Note');
const User = require('../model/User');
const Loca = require('../model/Loca');
//@ username, food , town , subdistrict , county , more
//@post
const HcreateLoca = async (req, res) => {
    const name = req.user;
    const { food, town, subdistrict, county, more } = req.body;

    if (!name || !food || !town || !subdistrict || !county) {
        console.log("Missing required fields");
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const foundUser = await User.findOne({ username : name }).lean().exec();
        if (!foundUser) {
            console.log("User not found");
            return res.status(401).json({ message: 'User not found' });
        }

        const loca = await Loca.create({ food, town, user: foundUser._id, subdistrict, county, more });
        return res.status(201).json({ message: 'Created', loca });
    } catch (error) {
        console.error("Error creating loca:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


//@get 
const HgetallLoca = async (req, res) => {
    const loca = await Loca.find().select('-__v').lean()

    // If no notes 
    if (!loca?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(loca.map(async (loca) => {
        const noteText = await Note.findById(loca.food).lean().exec()
        return { ...loca, text: noteText?.text }
    }))

    res.json(notesWithUser)    
};

//@ req.user
//@get
const HgetallUserLoca = async (req, res) => {
    const name = req.user;
    if (!name) return res.status(400).json({ message: 'Missing required fields' });

    try {
        const userId = await User.findOne({ username: name }).select('-__v').exec();
        const result  = await Loca.find({user : userId});

        res.json(result)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }


};
//@patch


const HupdateLoca = async (req , res ) => {
    const name = req.user;
    const { id, food, town, subdistrict, county, more } = req.body;

    if (!id || !name || !food || !town || !subdistrict || !county) {
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

//@ loca_id
//@delete

const HdeleteLoca = async (req , res) => {
    const {id} = req.body;
    const name = req.user;
    if (!id) {
        console.log(400)
        return res.status(401).json({message : 'bad request'});
    }
    const deleteLoca = await Loca.findById(id).exec();

    const foundUser = await User.findOne({username : name }).lean().exec();
    if (!deleteLoca.user.equals(foundUser._id)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!deleteLoca) return res.status(404).json({message : 'note is not found'});

    const result = await deleteLoca.deleteOne()
    res.json({message : id + 'note deleted'})

}

module.exports = { HcreateLoca , HgetallLoca , HdeleteLoca , HgetallUserLoca , HupdateLoca

};