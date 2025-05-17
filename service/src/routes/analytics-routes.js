const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');
const analyticsService = require('../services/analytics-service');

/**
 * @swagger
 * /analytics/{userId}:
 *   get:
 *     summary: Get user analytics with optional filters
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [debit, credit, refund, charges]
 *         description: Type of transaction
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *           enum: [ATM, POS, Internet Banking, Mobile Banking, Branch, UPI]
 *         description: Transaction channel
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Transaction category
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Account identifier
 *       - in: query
 *         name: cardId
 *         schema:
 *           type: string
 *         description: Card identifier
 *       - in: query
 *         name: beneficiaryId
 *         schema:
 *           type: string
 *         description: Beneficiary identifier
 */
router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        var {
            startDate,
            endDate,
            transactionType,
            channel,
            category,
            accountId,
            cardId,
            beneficiaryId,
            visualizationType
        } = req.query;

        // Validate date formats if provided
        if (!startDate && !isValidDate(startDate)) {
            startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
        }
        if (!endDate && !isValidDate(endDate)) {
            endDate = new Date().toISOString().split('T')[0];
        }

        if (!visualizationType) {
            visualizationType = 'line graph';
        }

        // Get filtered transactions
        const transactions = await analyticsService.getFilteredTransactions(userId, {
            startDate,
            endDate,
            transactionType,
            channel,
            category,
            accountId,
            cardId,
            beneficiaryId,
            visualizationType
        });

        // Get analytics data
        const analytics = await analyticsService.getTransactionAnalytics(userId, {
            startDate,
            endDate,
            transactionType,
            channel,
            category,
            accountId,
            cardId,
            beneficiaryId
        });

        const response = {
            userId,
            filtersApplied: {
                startDate: startDate || null,
                endDate: endDate || null,
                transactionType: transactionType || null,
                channel: channel || null,
                category: category || null,
                accountId: accountId || null,
                cardId: cardId || null,
                beneficiaryId: beneficiaryId || null
            },
            summary: {
                totalTransactions: analytics.totalTransactions,
                totalAmount: analytics.totalAmount,
                averageTransactionValue: analytics.averageTransactionValue
            },
            analytics: {
                transactionsByType: analytics.transactionsByType,
                transactionsByChannel: analytics.transactionsByChannel,
                transactionsByCategory: analytics.transactionsByCategory,
                monthlyTrends: analytics.monthlyTrends
            },
            data: transactions
        };

        logger.info(`Retrieved analytics for user ${userId} with ${transactions.length} transactions`);
        res.json(response);

    } catch (error) {
        logger.error(`Error retrieving analytics: ${error.message}`);
        next(error);
    }
});

// Helper function to validate date format
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

module.exports = router;
