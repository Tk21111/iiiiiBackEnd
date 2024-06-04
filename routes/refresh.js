const express = require('express');
const router = express.Router();
const authController = require('../controller/Hrefresh');

router.get('/', authController.Hrefresh);

module.exports = router;