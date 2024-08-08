const Note = require('../model/Note');
const User = require('../model/User');
const Loca = require('../model/Loca')
const multer = require('multer');
const path = require('path');4
const fs = require('fs')


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
        //console.log(result)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }


};


//@ user , context , count , done 
//@post
const Hcreate = async (req, res) => {
    try {
        const notes = req.body.notes || []; //somehow this thing have obj null prototpe in it but still work i wander why
        
        if (Array.isArray(notes)) {
            for (let i = 0; i < notes.length; i++) {

                const note = notes[i];
                const foundUser = await User.findOne({ username: note.username }).lean().exec();
                if (!foundUser) {
                    return res.status(401).json({ message: 'User not found' });
                }

                const duplicate = await Note.findOne({ text: note.text }).lean().exec();
                if (duplicate) {
                    return res.status(409).json({ noteId: duplicate._id });
                }

                //file path is in req.files
                const filePaths = req.files ? req.files.filter(file => file.fieldname.startsWith(`notes[${i}][files]`)).map(file => file.path) : [];
                console.log(filePaths)
                await Note.create({
                    text: note.text,
                    count: note.count,
                    user: foundUser._id,
                    timeOut: note.date,
                    tag: note.tag,
                    countExp: note.countExp,
                    done: note.done,
                    images: filePaths
                });
            }
            return res.status(201).json({ message: 'Created', data: notes });
        } else {
            return res.status(400).json({ message: 'Invalid data format' });
        }
    } catch (err) {
        console.error('Error creating notes:', err);
        return res.status(500).json({ message: 'Failed to create notes' });
    }
};


//@note_id , text ,count , countExp ,date tag , done
//@patch

const Hupdate = async (req , res ) => {
    const {text , id , count , countExp , date ,done , tag } =req.body;
    if (!text || !id || count < 0 || countExp < 0 || !date || (done === undefined || done === null || typeof done !== 'boolean')) {
        console.log(400);
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const foundNote = await Note.findById(id)
    if (!foundNote) return res.status(404).json({ message : "Didn't find note"});
    foundNote.count = count
    foundNote.done = done
    foundNote.countExp = countExp
    foundNote.timeOut = date
    foundNote.tag = tag
    foundNote.text = text

    foundNote.save();

    res.status(200).json({ message : 'note have been update'})

}

//@username ,note_id
//@delete
const Hdelete = async (req , res) => {
    const {id} = req.body;
    const user = req.user;

    //console.log('Note delete func')
    if (!user || !id) return res.status(401).json({message : 'bad request'});

    const foundUser = await User.findOne({ username: user }).lean().exec();
    if (!foundUser) return res.status(401).json({ message: 'User not found' });

    const deleteNote = await Note.findById(id).exec();
    const deleteLoca = await Loca.findOne({food : id }).exec();
    if (deleteLoca){
        //delete image for loca
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
    };
    deleteNote.images.forEach( p => {
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
    

    if (!deleteNote?.user?.equals(foundUser._id)) {
        console.log('NOT FOUND')
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!deleteNote) return res.status(404).json({message : 'note is not found'});

    try {
        await deleteLoca.deleteOne();
    } catch {
        console.log('No location post boned')
    }
    
    const result = await deleteNote.deleteOne();
    //console.log(result)
    res.status(200).json({message : "deleted"})
    //res.json({message : id + 'note deleted'})

}
module.exports = { Hcreate , Hdelete , Hupdate , Hgetall , HgetallUser };

