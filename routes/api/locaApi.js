const express = require('express');
const router = express.Router();
const LocaController = require('../../controller/Hnote');
const verifyRoles = require('../../middleware/verifyRoles');


router.route('/create')
    .post(LocaController.Hcreate);
/*
router.route('/update')
    .post(LocaController.Hupdate);
*/
router.route('/delete')
    .delete(LocaController.Hdelete);

router.route('/all')
    .get( LocaController.Hgetall);




module.exports = router;