const Note = require('../model/Note');
const User = require('../model/User');



const Hgetall = async (req, res) => {
    // Get all notes from MongoDB
    const notes = await Note.find().lean()

    // If no notes 
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))

    res.json(notesWithUser)

    
};
//@user 

const HgetallUser = async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Missing required fields' });

    try {
       const user_id = await User.findOne({username : username}).exec();
       const result  = await Note.find({user : user_id});
        res.json(result)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//@ user , context , count , done 

const Hcreate = async (req, res) => {
    const { user, text, count, done } = req.body;
    if (!user || !text || !count) return res.status(400).json({ message: 'Missing required fields' });

    try {
        const duplicate = await Note.findOne({ text: text }).lean().exec();
        if (duplicate) return res.status(409).json({ message: 'Note already exists' });

        const foundUser = await User.findOne({ username: user }).lean().exec();
        if (!foundUser) return res.status(401).json({ message: 'User not found' });

        const note = await Note.create({ text, count, done, user: foundUser._id });
        return res.status(201).json({ message: 'Created', note });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//@note_id , context , done
const Hupdate = async (req , res ) => {
    const {id , count , done} =req.body;
    if (!id || !count) return res.status(400).json({ message: 'Missing required fields' });

    const foundNote = await Note.findById(id)
    if (!foundNote) return res.status(404).json({ message : "Didn't find note"});
    foundNote.count = count
    foundNote.done = done

    foundNote.save();

    res.status(200).json({ message : 'note have been update'})

}

//@username ,note_id
const Hdelete = async (req , res) => {
    const {username , id} = req.body;

    if (!username || !id) return res.status(401).json({message : 'bad request'});
    const foundUser = await User.findOne({ username: username }).lean().exec();
    if (!foundUser) return res.status(401).json({ message: 'User not found' });

    const deleteNote = await Note.findById(id).exec();

    if (!deleteNote.user.equals(foundUser._id)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!deleteNote) return res.status(404).json({message : 'note is not found'});

    const result = await deleteNote.deleteOne()

    res.json({message : id + 'note deleted'})

}
module.exports = { Hcreate , Hdelete , Hupdate , Hgetall , HgetallUser };
