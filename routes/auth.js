const express = require('express');
const router = express.Router();
const authController = require('../controller/Hauth');

router.post('/', authController.Hauth);

module.exports = router;