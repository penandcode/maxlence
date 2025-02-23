const express = require('express');
const dataController = require('../controllers/dataController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware'); 

const router = express.Router();

router.get('/data', isAuthenticated, dataController.fetchData); 

router.get('/users', isAdmin, dataController.fetchUsers); 

router.delete('/users/:id', isAdmin, dataController.deleteUser); 





module.exports = router;
