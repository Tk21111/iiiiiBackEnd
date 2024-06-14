const express = require('express');
const router = express.Router();
const LocaController = require('../../controller/Hloca');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .patch( LocaController.HgetallUserLoca)
router.route('/all')
    .get( LocaController.HgetallLoca);
router.route('/create')
    .post(LocaController.HcreateLoca);
router.route('/create')
    .patch(LocaController.HupdateLoca);
router.route('/delete')
    .delete(LocaController.HdeleteLoca);

module.exports = router;