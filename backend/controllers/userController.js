const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');

exports.validateUserUpdate = [
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({min: 8})
];

exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        if (req.user.id.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                status: 'fail',
                message: 'Not authorized to access this profile'
            });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation error',
                errors: errors.array()
            });
        }

        const userId = req.params.id;

        if (req.user.id.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                status: 'fail',
                message: 'Not authorized to update this profile'
            });
        }

        const updateData = {...req.body};

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        if (!req.user.isAdmin && updateData.hasOwnProperty('isAdmin')) {
            delete updateData.isAdmin;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {new: true, runValidators: true}
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        // Ensure requestor is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 'fail',
                message: 'Admin access required'
            });
        }

        const users = await User.find().select('-password');

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Ensure requestor is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                status: 'fail',
                message: 'Admin access required'
            });
        }

        const userId = req.params.id;

        if (req.user.id === userId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Cannot delete your own account'
            });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};