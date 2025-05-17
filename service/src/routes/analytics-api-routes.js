const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const analyticsApiService = require('../services/analytics-api-service');

/**
 * @swagger
 * /api/analytics/data:
 *   get:
 *     summary: Fetches visualization data based on metadata from the NLP service
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: analyticsType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of analytics (e.g., "spending_trends", "income_analysis")
 *       - in: query
 *         name: visualizationType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of visualization (e.g., "bar_chart", "line_chart", "table")
 *       - in: query
 *         name: moduleCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Module code (e.g., "ANALYTICS")
 *       - in: query
 *         name: submoduleCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Submodule code (e.g., "ANALYTICS_SPENDING")
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON string containing filter parameters
 *       - in: query
 *         name: entities
 *         schema:
 *           type: string
 *         description: JSON string containing entities from NLP response
 */
router.post('/data', async (req, res, next) => {
    try {
        const {
            userId,
            analyticsType,
            visualizationType,
            moduleCode,
            submoduleCode,
            filters,
            entities
        } = req.body;

        // Validate required parameters
        if (!userId || !analyticsType || !visualizationType || !moduleCode || !submoduleCode) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        // Parse JSON strings if provided
        // const parsedFilters = filters ? JSON.parse(filters) : {};
        // const parsedEntities = entities ? JSON.parse(entities) : {};

        // Get analytics data
        const analyticsData = await analyticsApiService.getAnalyticsData(
            userId,
            analyticsType,
            visualizationType,
            moduleCode,
            submoduleCode,
            filters,
            entities
        );

        logger.info(`Retrieved ${analyticsType} analytics data for user ${userId}`);
        res.json(analyticsData);

    } catch (error) {
        logger.error(`Error retrieving analytics data: ${error.message}`);
        if (error.message.includes('JSON')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid JSON format in filters or entities'
            });
        }
        next(error);
    }
});

/**
 * @swagger
 * /api/analytics/types:
 *   get:
 *     summary: Retrieves available analytics types and their descriptions
 */
router.get('/types', async (req, res, next) => {
    try {
        const analyticsTypes = await analyticsApiService.getAnalyticsTypes();
        res.json({ analyticsTypes });
    } catch (error) {
        logger.error(`Error retrieving analytics types: ${error.message}`);
        next(error);
    }
});

/**
 * @swagger
 * /api/analytics/visualizations:
 *   get:
 *     summary: Returns supported visualization types and their descriptions
 */
router.get('/visualizations', async (req, res, next) => {
    try {
        const visualizationTypes = await analyticsApiService.getVisualizationTypes();
        res.json({ visualizationTypes });
    } catch (error) {
        logger.error(`Error retrieving visualization types: ${error.message}`);
        next(error);
    }
});

/**
 * @swagger
 * /api/analytics/spending:
 *   get:
 *     summary: Specialized endpoint for spending analytics
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Time period to analyze (e.g., "month", "quarter", "year")
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom period (YYYY-MM-DD)
 *       - in: query
 *         name: visualizationType
 *         schema:
 *           type: string
 *         description: Type of visualization (default is "line_chart")
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by spending category
 *       - in: query
 *         name: merchant
 *         schema:
 *           type: string
 *         description: Filter by merchant
 */
router.get('/spending', async (req, res, next) => {
    try {
        const {
            userId,
            period,
            startDate,
            endDate,
            visualizationType = 'line_chart',
            category,
            merchant
        } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const filters = {
            startDate,
            endDate,
            category,
            merchant
        };

        const entities = { period };

        const spendingAnalytics = await analyticsApiService.getSpendingAnalytics(
            userId,
            visualizationType,
            filters,
            entities
        );

        logger.info(`Retrieved spending analytics for user ${userId}`);
        res.json(spendingAnalytics);

    } catch (error) {
        logger.error(`Error retrieving spending analytics: ${error.message}`);
        next(error);
    }
});

/**
 * @swagger
 * /api/analytics/income:
 *   get:
 *     summary: Specialized endpoint for income analytics
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Time period to analyze
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom period (YYYY-MM-DD)
 *       - in: query
 *         name: visualizationType
 *         schema:
 *           type: string
 *         description: Type of visualization (default is "line_chart")
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by income source
 */
router.get('/income', async (req, res, next) => {
    try {
        const {
            userId,
            period,
            startDate,
            endDate,
            visualizationType = 'line_chart',
            source
        } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const filters = {
            startDate,
            endDate,
            source
        };

        const entities = { period };

        const incomeAnalytics = await analyticsApiService.getIncomeAnalytics(
            userId,
            visualizationType,
            filters,
            entities
        );

        logger.info(`Retrieved income analytics for user ${userId}`);
        res.json(incomeAnalytics);

    } catch (error) {
        logger.error(`Error retrieving income analytics: ${error.message}`);
        next(error);
    }
});

/**
 * @swagger
 * /api/analytics/transactions:
 *   get:
 *     summary: Specialized endpoint for transaction analytics
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Time period to analyze
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom period (YYYY-MM-DD)
 *       - in: query
 *         name: visualizationType
 *         schema:
 *           type: string
 *         description: Type of visualization (default is "table")
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *         description: Filter by transaction type
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum transaction amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum transaction amount
 */
router.get('/transactions', async (req, res, next) => {
    try {
        const {
            userId,
            period,
            startDate,
            endDate,
            visualizationType = 'table',
            transactionType,
            minAmount,
            maxAmount
        } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const filters = {
            startDate,
            endDate,
            transactionType,
            minAmount: minAmount ? parseFloat(minAmount) : undefined,
            maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
        };

        const entities = { period };

        const transactionAnalytics = await analyticsApiService.getTransactionAnalytics(
            userId,
            visualizationType,
            filters,
            entities
        );

        logger.info(`Retrieved transaction analytics for user ${userId}`);
        res.json(transactionAnalytics);

    } catch (error) {
        logger.error(`Error retrieving transaction analytics: ${error.message}`);
        next(error);
    }
});

module.exports = router; 