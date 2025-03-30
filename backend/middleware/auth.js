const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/userModel');

exports.isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'fail',
                message: 'Not authorized, no token'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'User no longer exists'
            });
        }

        req.user = {
            id: user._id,
            isAdmin: user.isAdmin
        };

        next();
    } catch (error) {
        return res.status(401).json({
            status: 'fail',
            message: 'Not authorized, token failed'
        });
    }
};

exports.optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Just continue without setting user
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded.id).select('-password');

        if (user) {
            req.user = {
                id: user._id,
                isAdmin: user.isAdmin
            };
        }

        next();
    } catch (error) {
        next();
    }
};

exports.isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            status: 'fail',
            message: 'Admin access required'
        });
    }
    next();
};