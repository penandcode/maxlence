const Data = require('../models/Data');
const User = require('../models/User');


exports.fetchData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: data } = await Data.findAndCountAll({
      limit,
      offset
    });

    res.json({
      data,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to fetch data' });
  }
};


exports.fetchUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['email', 'isVerified', 'profileImage', 'createdAt', 'id'],
      limit,
      offset
    });

    res.json({
      users,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to fetch users' });
  }
};


exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.id === id) {
      return res.status(400).json({ msg: 'You cannot delete yourself' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    await user.destroy();
    res.json({ msg: 'User deleted successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to delete user' });
  }
};
