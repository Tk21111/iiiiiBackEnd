const express = require('express');
const router = express.Router();
const randnumController = require('../../controller/Hrand');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(randnumController.getrand);

router.route('/get')
    .get(randnumController.setrand);

router.route('/all')
    .get(verifyRoles(['Editor']), randnumController.getAll);

/*
router.route('/check')
    .get(verifyRoles(ROLES_LIST.Editor), randnumController.checkDupilcate);

router.route('/admincmd')
    .get(verifyRoles(ROLES_LIST.Admin), randnumController.adminGive);

router.route('/giveBy')
    .get(verifyRoles(ROLES_LIST.Editor) , randnumController.giveBy);

*/

module.exports = router;