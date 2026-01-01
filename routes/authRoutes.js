const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/police/register', authController.registerPolice);
router.post('/police/login', authController.loginPolice);

module.exports = router;
