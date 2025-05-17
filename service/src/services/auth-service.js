const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth-middleware');
const { AppError } = require('../middleware/error-handler');
const { logger } = require('../utils/logger');
const { users } = require('../data/users.json');

const login = async (username, password) => {
    if (!username || !password) {
        throw new AppError('Username and password are required', 400);
    }

    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
        { 
            id: user.id, 
            username: user.username,
            role: user.role,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    logger.info(`User ${username} logged in successfully`);
    
    return {
        success: true,
        token,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

const logout = async (user) => {
    // In a real application, you might want to invalidate the token
    // This could involve adding it to a blacklist in Redis/database
    logger.info(`User ${user.username} logged out successfully`);
    
    return {
        success: true,
        message: 'Logged out successfully'
    };
};

module.exports = {
    login,
    logout
}; 