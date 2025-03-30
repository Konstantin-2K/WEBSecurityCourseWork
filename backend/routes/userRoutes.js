const express = require('express');
const userController = require('../controllers/userController');
const {isAuthenticated, isAdmin} = require('../middleware/auth');

const router = express.Router();
router.use(isAuthenticated);
router.get('/', isAdmin, userController.getAllUsers);
router.get('/:id', userController.getProfile);
router.patch('/:id', userController.validateUserUpdate, userController.updateProfile);
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;