const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const {body, validationResult} = require('express-validator');

exports.validateRegister = [
    body('username').trim().isLength({min: 3}).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min: 8})
];

exports.validateLogin = [
    body('username').trim().escape(),
    body('password').exists()
];

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation error',
                errors: errors.array()
            });
        }

        const {username, password, email} = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            isAdmin: false
        });

        await newUser.save();

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation error',
                errors: errors.array()
            });
        }

        const {username, password} = req.body;
        const user = await User.findOne({username});

        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid username or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            {id: user._id, isAdmin: user.isAdmin},
            config.jwtSecret,
            {expiresIn: config.jwtExpiresIn}
        );

        res.status(200).json({
            status: 'success',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};