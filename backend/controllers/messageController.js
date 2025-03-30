const Message = require('../models/messageModel');
const {isAuthenticated} = require('../middleware/auth');

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().populate('user', 'username');

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: {
                messages
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const {content} = req.body;
        const userId = req.user ? req.user.id : '000000000000000000000000';
        const newMessage = await Message.create({
            content,
            user: userId
        });

        res.status(201).json({
            status: 'success',
            data: {
                message: newMessage
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.user ? req.user.id : null;
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                status: 'fail',
                message: 'Message not found'
            });
        }

        if (userId && (message.user.toString() === userId.toString() || req.user.isAdmin)) {
            await Message.findByIdAndDelete(messageId);

            return res.status(204).json({
                status: 'success',
                data: null
            });
        } else {
            return res.status(403).json({
                status: 'fail',
                message: 'Not authorized to delete this message'
            });
        }
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.getMessage = async (req, res) => {
    try {
        const messageId = req.params.id;

        // Secure way to find a message
        const message = await Message.findById(messageId).populate('user', 'username');

        if (!message) {
            return res.status(404).json({
                status: 'fail',
                message: 'Message not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                message
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};