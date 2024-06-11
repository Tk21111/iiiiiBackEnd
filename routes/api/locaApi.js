const express = require('express');
const router = express.Router();
const LocaController = require('../../controller/Hnote');
const verifyRoles = require('../../middleware/verifyRoles');


router.route('/all')
    .get( LocaController.Hgetall);

router.route('/create')
    .post(LocaController.Hcreate);
router.route('/delete')
    .delete(LocaController.Hdelete);

module.exports = router;