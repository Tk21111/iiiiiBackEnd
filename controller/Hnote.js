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
const Hdelete = async (req , res) => {
    const {id} = req.body;
    const user = req.user;

    //console.log('Note delete func')
    if (!user || !id) return res.status(401).json({message : 'bad request'});

    const foundUser = await User.findOne({ username: user }).lean().exec();
    if (!foundUser) return res.status(401).json({ message: 'User not found' });

    const deleteNote = await Note.findById(id).exec();
    const deleteLoca = await Loca.findOne({food : id }).exec();
    
    if (!deleteNote?.user?.equals(foundUser._id)) {
        console.log('NOT FOUND')
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!deleteNote) return res.status(404).json({message : 'note is not found'});

    try {
        /*
        if (deleteNote.images) {
            const deleteResults = await Promise.all(
                deleteNote.images.map(async (info) => {
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
            
        if (deleteLoca){
          //delete image for loca
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
        }*/
  
          
        await deleteLoca.deleteOne();
     
      
      }
        
    } catch {
        console.log('No location post boned')
    }
    
    const result = await deleteNote.deleteOne();
    //console.log(result)
    res.status(200).json({message : "deleted"})
    //res.json({message : id + 'note deleted'})

}
module.exports = { Hcreate , Hdelete , Hupdate , Hgetall , HgetallUser , HcreateJazer };

