const Note = require('../model/Note');
const User = require('../model/User');




const Hgetall = async (req, res) => {
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
//@patch
const HgetallUser = async (req, res) => {
    const name = req.user;
    if (!name) return res.status(400).json({ message: 'Missing required fields' });

    try {
        const userId = await User.findOne({ username: name }).select('-__v').exec();
        const result  = await Note.find({user : userId});

        res.json(result)
        console.log(result)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }


};
const HgetUser = async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Missing required fields' });

    try {
        const result  = await Note.find({ _id : id}).exec();
        res.json(result)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }


};

//@ user , context , count , done 
//@post
const Hcreate = async (req, res) => {
    const { username, text, count , date , tag } = req.body;
    if (!username || !text || !count) return res.status(400).json({ message: 'Missing required fields' });

    try {
        const duplicate = await Note.findOne({ text: text }).lean().exec();
        if (duplicate) return res.status(409).json({ message: 'Note already exists' });

        const foundUser = await User.findOne({ username: username }).lean().exec();
        if (!foundUser) return res.status(401).json({ message: 'User not found' });

        const note = await Note.create({ text, count, user: foundUser._id , timeOut : date , tag});
        return res.status(201).json({ message: 'Created', note });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//@note_id , context , done
//@patch

const Hupdate = async (req , res ) => {
    const {id , count , countExp , date ,done} =req.body;
    console.log(id)
    console.log(count)
    console.log(date)
    console.log(done)
    if (!id || !count || !date || (done === undefined || done === null || typeof done !== 'boolean')) {
        console.log(400);
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const foundNote = await Note.findById(id)
    if (!foundNote) return res.status(404).json({ message : "Didn't find note"});
    foundNote.count = count
    foundNote.done = done
    foundNote.countExp = countExp
    foundNote.timeOut = date

    foundNote.save();

    res.status(200).json({ message : 'note have been update'})

}

//@username ,note_id
//@delete
const Hdelete = async (req , res) => {
    const {username , id} = req.body;

    console.log('Note delete func')
    if (!username || !id) return res.status(401).json({message : 'bad request'});
    const foundUser = await User.findOne({ username: username }).lean().exec();
    if (!foundUser) return res.status(401).json({ message: 'User not found' });

    const deleteNote = await Note.findById(id).exec();

    if (!deleteNote.user.equals(foundUser._id)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!deleteNote) return res.status(404).json({message : 'note is not found'});

    const result = await deleteNote.deleteOne()
    console.log(result)
    res.sendStatus(200)
    //res.json({message : id + 'note deleted'})

}
module.exports = { Hcreate , Hdelete , Hupdate , Hgetall , HgetallUser };

