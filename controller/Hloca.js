const Note = require('../model/Note');
const User = require('../model/User');
const Loca = require('../model/Loca');
//@ username, food , town , subdistrict , county , more
//@post
const Hcreate = async (req, res) => {
    console.log("Request body:", req.body);
    const { username, food, town, subdistrict, county, more } = req.body;

    if (!username || !food || !town || !subdistrict || !county) {
        console.log("Missing required fields");
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const foundUser = await User.findOne({ username: username }).lean().exec();
    if (!foundUser) {
        console.log("User not found");
        return res.status(401).json({ message: 'User not found' });
    }

    const loca = await Loca.create({ food, town, user: foundUser._id, subdistrict, county, more });
    return res.status(201).json({ message: 'Created', loca });
};


//@get 
const Hgetall = async (req, res) => {
    const loca = await Loca.find().lean()

    // If no notes 
    if (!loca?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(loca.map(async (note) => {
        const noteText = await Note.findById(loca.food).lean().exec()
        return { ...note, text: noteText.text }
    }))

    res.json(notesWithUser)    
};

//@ loca_id
//@delete
const Hdelete = async (req , res) => {
    const {id} = req.body;

    if (!id) return res.status(401).json({message : 'bad request'});
    const deleteLoca = await Loca.findById(id).exec();

    if (!deleteLoca.user.equals(foundUser._id)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!deleteLoca) return res.status(404).json({message : 'note is not found'});

    const result = await deleteLoca.deleteOne()

    res.json({message : id + 'note deleted'})

}

module.exports = { Hcreate , Hgetall , Hdelete};