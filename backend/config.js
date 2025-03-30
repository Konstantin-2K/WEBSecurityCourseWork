require('dotenv').config();

module.exports = {
    dbUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/vulnerable_website',
    jwtSecret: process.env.JWT_SECRET || 'temporary_secret_for_demo',
    jwtExpiresIn: '1h'
};