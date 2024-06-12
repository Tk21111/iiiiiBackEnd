const express = require('express');
const router = express.Router();
const LocaController = require('../../controller/Hloca');
const verifyRoles = require('../../middleware/verifyRoles');


router.route('/all')
    .get( LocaController.HgetallLoca);
router.route('/create')
    .post(LocaController.HcreateLoca);
router.route('/delete')
    .delete(LocaController.HdeleteLoca);

module.exports = router;