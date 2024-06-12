const Note = require('../model/Note');
const User = require('../model/User');
const Loca = require('../model/Loca');
//@ username, food , town , subdistrict , county , more
//@post
const HcreateLoca = async (req, res) => {
    console.log("Request body:", req);
    const name = req.user;
    const { food, town, subdistrict, county, more } = req.body;
    console.log(req.body)
    console.log(name)
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
        return { ...loca, text: noteText.text }
    }))

    res.json(notesWithUser)    
};

//@ loca_id
//@delete
const HdeleteLoca = async (req , res) => {
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

module.exports = { HcreateLoca , HgetallLoca , HdeleteLoca};