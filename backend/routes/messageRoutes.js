const express = require('express');
const messageController = require('../controllers/messageController');
const {isAuthenticated, optionalAuth} = require('../middleware/auth');

const router = express.Router();

router.get('/', messageController.getAllMessages);
router.get('/:id', messageController.getMessage);
router.post('/', optionalAuth, messageController.createMessage);
router.delete('/:id', isAuthenticated, messageController.deleteMessage);

module.exports = router;