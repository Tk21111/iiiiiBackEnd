const express = require('express');
const router = express.Router();
const authController = require('../controller/Hregistor');

router.post('/', authController.Hnewuser);

module.exports = router;