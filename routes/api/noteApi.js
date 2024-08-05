const express = require('express');
const router = express.Router();
const NoteController = require('../../controller/Hnote');
const verifyRoles = require('../../middleware/verifyRoles');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'pubilc/image'); // specify the folder where the files should be saved
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
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