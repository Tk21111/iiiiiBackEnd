const express = require('express');
const router = express.Router();
const NoteController = require('../../controller/Hnote');
const verifyRoles = require('../../middleware/verifyRoles');


router.route('/')
    .get(NoteController.HgetallUser);

router.route('/create')
    .post(NoteController.Hcreate);

router.route('/update')
    .post(NoteController.Hupdate);

router.route('/delete')
    .delete(NoteController.Hdelete);

router.route('/all')
    .get(//verifyRoles(['Editor']), 
    NoteController.Hgetall);




module.exports = router;