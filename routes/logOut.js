const express = require('express');
const router = express.Router();
const authController = require('../controller/Hlogout');

router.get('/', authController.HLogout);

module.exports = router;