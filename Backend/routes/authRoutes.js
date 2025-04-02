
const express = require('express');
const { getMe } = require('../controller/authController')
// const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me',getMe);

module.exports = router;
