const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth-middleware');
const customer360Service = require('../services/customer-360-service');
const { logger } = require('../utils/logger');

// Get Customer 360 View
router.get('/:userId', verifyToken, async (req, res, next) => {
    try {
        // Check if the requesting user is an admin or the customer themselves
        // if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.userId)) {
        //     return res.status(403).json({
        //         success: false,
        //         error: 'Access denied. Insufficient privileges.'
        //     });
        // }

        const customer360Data = await customer360Service.getCustomer360Data(req.params.userId);
        res.json(customer360Data);
    } catch (error) {
        logger.error(`Error in customer 360 route: ${error.message}`);
        next(error);
    }
});

module.exports = router; 