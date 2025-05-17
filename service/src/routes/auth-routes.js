const express = require('express');
const router = express.Router();
const authService = require('../services/auth-service');
const { verifyToken } = require('../middleware/auth-middleware');
const { AppError } = require('../middleware/error-handler');

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/logout', verifyToken, async (req, res, next) => {
    try {
        const result = await authService.logout(req.user);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 