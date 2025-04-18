const Note = require('../model/Note');
const User = require('../model/User');
const Loca = require('../model/Loca')
const multer = require('multer');
const path = require('path');4
const fs = require('fs')
const { Storage } = require('@google-cloud/storage');
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Google Cloud Storage configuration
const storage = new Storage({credentials // Path to your service account key file
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

const Hgetall = async (req, res) => {

    const username = req.user;

    try {
      const user =  await User.findOne({"username" : username}).exec();

      const notes = await Note.find({"user" : user});

      // If no notes 
      if (!notes) {
          return res.status(400).json({ message: 'No notes found' })
      }

      const date = new Date();

      for (let [index, note] of notes.entries()) {
          if (!note.timeOut) continue; // Skip if timeOut is undefined/null

          const dateTimeOut = new Date(note.timeOut);
          if (dateTimeOut < date && !note.done) {
              // Ensure countExp and count arrays exist
              if (!Array.isArray(note.countExp)) note.countExp = [];
              if (!Array.isArray(note.count)) note.count = [];

              const lastCountExp = note.countExp.length ? note.countExp[note.countExp.length - 1] : 0;
              const lastCount = note.count.length ? note.count[note.count.length - 1] : 0;

              note.countExp.push(lastCountExp + lastCount - lastCountExp);
              note.count.push(lastCount);
              note.typeCount = "undefined";
              note.done = true;
          }
      }

      // If notes is a Mongoose collection, update in bulk
      await Promise.all(notes.map(note => note.save())); // Save all notes


      res.json(notes)
    } catch (err) {
      console.log(err + " ; Hgetall")
      return res.sendStatus(500)
    }
    

    /*
    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))

    res.json(notesWithUser)
    */

    
};



//@ user , context , count , done 
//@post
const Hcreate = async (req, res) => {

    console.log(req.body.notes)
    try {
        const notes = req.body.notes || []; //somehow this thing have obj null prototpe in it but still work i wander why

        console.log(req.body)
        const info = req.body.fileInfo
        if (Array.isArray(notes)) {
            for (let f ;f < notes.length; f++){

            }
            for (let i = 0; i < notes.length; i++) {

                const note = notes[i];
                //nice check user in note idk why but think past me (in process of org donate get food to appear)
                const foundUser = await User.findOne({ username: req.user }).lean().exec();
                if (!foundUser) {
                    return res.status(401).json({ message: 'User not found' });
                }


                //file path is in req.files

       
                const image = req.files ? info.filter(file => file.fieldName === `notes[${i}][files]`) : [];
                         
                await Note.create({
                    text: note.text,
                    count: note.count || 1,
                    user: foundUser._id,
                    timeOut: note.date,
                    tag: note.tag,
                    typeCount : note.typeCount || "",
                    countExp: note.countExp || 0,
                    images: image,
                    donate : note.donate
                });
            }
            return res.status(201).json({ message: 'Created', data: notes });
        } else {
            return res.status(400).json({ message: 'Invalid data format' });
        }
    } catch (err) {
        console.error('Error creating notes:', err);
        //return res.status(500).json({ message: 'Failed to create notes' });
    }
};

const HcreateJazer = async (req , res) => {

  console.log(req)
  try {

    const note = req.body;

    if(!note) return res.status(400).json({"message" : "bad req"});

    const user = await User.findOne({username : req.user}).exec();

    if(!user ) return res.status(401).json({"message" : "not found user"});

    await Note.create({

      user : user,
      text : note.text || "" ,
      count : note.count || 1 ,
      timeOut : note.timeOut ,
      typeCount : note.typeCount || "" 

    })

    return res.status(200).json({"message" : "sucessfully create"});
  } catch (err) {
    console.log(err + " ; HcreateJazer")
    return res.status(500).json({"err" : err});
  }
}
//@note_id , text ,count , countExp ,date tag , done
//@patch

const Hupdate = async (req , res ) => {
    const {text , id , count , countExp , date ,done , tag , update , typeCount} = req.body;

    if ( !id && update === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try{
      const foundNote = await Note.findById(id);

      if (!foundNote) return res.status(404).json({ message : "Didn't find note"});
        if (count !== undefined) {
          if(update){
            foundNote.count = [...foundNote.count , count ];
          } else {
            foundNote.count[foundNote.count.length - 1 ] = count;
          }
          }
        if (done !== undefined) {
          foundNote.done = done;
        }
        if (countExp !== undefined) {
          if(update){
            foundNote.countExp = [...foundNote.countExp , countExp ];
          } else {
            foundNote.countExp[foundNote.countExp.length -1] = countExp;
          }
          
        }
        if (date !== undefined) {
          foundNote.timeOut = date;
        }
        if (tag !== undefined) {
          foundNote.tag = tag;
        }
        if (text !== undefined) {
          foundNote.text = text;
        }
        if (typeCount !== undefined) {
          foundNote.typeCount = typeCount
        } else if (foundNote.typeCount === undefined) {
          foundNote.typeCount = "undefined";
        }

      foundNote.save();

      return res.status(200).json({ message : 'note have been update'})
    } catch (err) {
      console.log(err + " ; Hupdate")
      return res.json(err)    
    }
    

}

//@username ,note_id
//@delete
const Hdelete = async (req, res) => {
    const { id } = req.body;
    const user = req.user;

    if (!user || !id) return res.status(401).json({ message: 'Bad request' });

    try {
        const foundUser = await User.findOne({ username: user }).lean().exec();
        if (!foundUser) return res.status(401).json({ message: 'User not found' });

        const deleteNote = await Note.findById(id).exec();
        const deleteLoca = await Loca.findOne({ food: id }).exec();

        if (!deleteNote?.user?.equals(foundUser._id)) {
            console.log('NOT FOUND');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!deleteNote) return res.status(404).json({ message: 'Note is not found' });

        // Optional: Debug logging to check the images and loca data
        console.log('Deleting Note:', deleteNote);
        console.log('Associated Loca:', deleteLoca);

        // Delete images logic (if applicable)
        /*
        if (deleteNote.images) {
            const deleteResults = await Promise.all(
                deleteNote.images.map(async (info) => {
                    try {
                        const result = await deleteFromGCS(info.fileName);
                        return result.success;
                    } catch (err) {
                        console.error(`Error deleting file ${info.fileName}:`, err);
                        return false;
                    }
                })
            );

            if (!deleteResults.every((result) => result)) {
                return res.status(500).json({ message: "Failed to delete all images" });
            }
        }
        */

        if (deleteLoca) {
            // Optional: Delete images associated with the loca (if any)
            /*
            if (deleteLoca.images) {
                const deleteResults = await Promise.all(
                    deleteLoca.images.map(async (info) => {
                        try {
                            const result = await deleteFromGCS(info.fileName);
                            return result.success;
                        } catch (err) {
                            console.error(`Error deleting file ${info.fileName}:`, err);
                            return false;
                        }
                    })
                );

                if (!deleteResults.every((result) => result)) {
                    return res.status(500).json({ message: "Failed to delete all loca images" });
                }
            }
            */
            await deleteLoca.deleteOne();
        }

        // Now, delete the note itself
        await deleteNote.deleteOne();

        return res.status(200).json({ message: 'Deleted successfully' });

    } catch (err) {
        console.error('Error during deletion process:', err);
        return res.status(500).json({ message: 'An error occurred while deleting' });
    } finally {
        // Optional: Add any cleanup or logging actions here if needed.
        console.log('Deletion process finished');
    }
};

module.exports = { Hcreate , Hdelete , Hupdate , Hgetall , HcreateJazer };

