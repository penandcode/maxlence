const jwt = require('jsonwebtoken');
const config = require('../config/index');
const User = require('../models/User');


const isAuthenticated = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};


const isAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied, admin privileges required' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};


module.exports = { isAuthenticated, isAdmin };
