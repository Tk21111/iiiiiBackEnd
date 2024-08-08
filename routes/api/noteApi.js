const express = require('express');
const router = express.Router();
const NoteController = require('../../controller/Hnote');
const verifyRoles = require('../../middleware/verifyRoles');
const multer = require('multer');
const path = require('path');
const {pathChecker , nameChecker} =  require('./pathFindder');
const { v4: uuidv4 } = require('uuid');



const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        await pathChecker(req , file);
        
        cb(null, `pubilc/image/${req.user}`); // specify the folder where the files should be saved
    },
    filename: async function (req, file, cb) {
        const ext = path.extname(file.originalname);  // Get the file extension
        const uniqueName = `${uuidv4()}${ext}`;  // Create a unique name using UUID and original extension
        cb(null, uniqueName);  // Save the file with the new name
    }
});

const upload = multer({ storage: storage });

router.route('/')
    .patch(NoteController.HgetallUser);


router.route('/create')
    .post(upload.any(),NoteController.Hcreate);


router.route('/update')
    .patch(NoteController.Hupdate);

router.route('/delete')
    .delete(NoteController.Hdelete);

router.route('/all')
    .get(//verifyRoles(['Editor']), 
    NoteController.Hgetall);




module.exports = router;