const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { upload } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  upload.single('profileImage'),
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  authController.register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);

router.get('/check-admin', authController.checkAdmin);

router.post('/reset-password/', authController.resetPassword);

router.get('/verify-email/:token', authController.verifyEmail);




module.exports = router;
