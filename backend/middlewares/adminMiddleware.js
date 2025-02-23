const jwt = require('jsonwebtoken');
const config = require('../config/index');
const User = require('../models/User');


const isAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ msg: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = isAdmin;
