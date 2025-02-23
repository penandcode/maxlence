const { validationResult } = require('express-validator');
const multer = require('multer');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

exports.upload = multer({ storage });


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const config = require("../config/index");
const Redis = require('ioredis');

const redis = new Redis();


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};


const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
  });
};


const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  },
});

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {

    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }


    user = await User.create({ email, password, profileImage: req.file ? req.file.path : null });



    const verificationToken = jwt.sign(
      { userId: user.id },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );


    const verificationUrl = `${config.FRONTEND_URL}/verify-email/${verificationToken}`;
    await transporter.sendMail({
      from: config.SMTP_USER,
      to: email,
      subject: 'Email Verification',
      html: `Please click this link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
    });

    res.status(201).json({ msg: 'Registration successful. Please check your email for verification.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.checkAdmin = async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ isAdmin: false });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(403).json({ isAdmin: false });
    }

    res.json({ isAdmin: user.role === 'admin' ? true : false });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ isAdmin: false });
  }
};


exports.login = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }


    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }


    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email first' });
    }


    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({ token, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(400).json({ msg: 'Invalid token' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.requestPasswordReset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }


    const resetToken = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '30m' });


    await redis.setex(resetToken, 1800, user.id);


    const resetUrl = `${config.FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: config.SMTP_USER,
      to: email,
      subject: 'Password Reset',
      html: `Please click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ msg: 'Password reset email sent. Please check your inbox.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ msg: 'No refresh token provided' });
  }

  try {

    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);


    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }


    const newToken = generateToken(user.id);

    res.json({ token: newToken });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Invalid refresh token' });
  }
};


exports.resetPassword = async (req, res) => {

  const { token, password } = req.body;

  try {

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(400).json({ msg: 'Invalid token' });
    }


    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);


    await user.save();


    await redis.del(token);

    res.json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
