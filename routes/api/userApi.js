const express = require('express');
const router = express.Router();
const UserController = require('../../controller/Huser')
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

router.route('/update')
    .patch(upload.array('images'), UserController.updateProfile);

router.route('/get')
    .patch(UserController.getUser);

router.route('/get/org')
    .get(UserController.getOrg);

module.exports = router;