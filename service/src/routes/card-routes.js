const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth-middleware');
const cardService = require('../services/card-service');

// Get Available Card Products
router.get('/products', verifyToken, async (req, res, next) => {
    try {
        const products = await cardService.getCardProducts();
        res.json(products);
    } catch (error) {
        next(error);
    }
});

// Get Card Product Details
router.get('/products/:productId', verifyToken, async (req, res, next) => {
    try {
        const product = await cardService.getCardProductDetails(req.params.productId);
        res.json(product);
    } catch (error) {
        next(error);
    }
});

// Apply for a New Card
router.post('/apply', verifyToken, async (req, res, next) => {
    try {
        const application = await cardService.applyForCard(req.user.id, req.body);
        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
});

// Get User's Cards
router.get('/user/:userId', verifyToken, async (req, res, next) => {
    try {
        const {cardId, cardType, last4Digits, cardStatus} = req.query;
        const cards = await cardService.getUserCards(req.params.userId, cardId, cardType, last4Digits, cardStatus);
        res.json(cards);
    } catch (error) {
        next(error);
    }
});

// Get Card Details
router.get('/:cardId', verifyToken, async (req, res, next) => {
    try {
        const card = await cardService.getCardDetails(req.user.id, req.params.cardId);
        res.json(card);
    } catch (error) {
        next(error);
    }
});

// Activate Card
router.post('/:cardId/activate', verifyToken, async (req, res, next) => {
    try {
        const result = await cardService.activateCard(
            req.user.id,
            req.params.cardId,
            req.body.activationCode
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Block Card
router.post('/:cardId/block', verifyToken, async (req, res, next) => {
    try {
        const result = await cardService.blockCard(
            req.user.id,
            req.params.cardId,
            req.body.reason
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Unblock Card
router.post('/:cardId/unblock', verifyToken, async (req, res, next) => {
    try {
        const result = await cardService.unblockCard(
            req.user.id,
            req.params.cardId
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Set PIN
router.post('/:cardId/set-pin', verifyToken, async (req, res, next) => {
    try {
        const result = await cardService.setCardPin(
            req.user.id,
            req.params.cardId,
            req.body.pin
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Change PIN
router.post('/:cardId/change-pin', verifyToken, async (req, res, next) => {
    try {
        const result = await cardService.changeCardPin(
            req.user.id,
            req.params.cardId,
            req.body.oldPin,
            req.body.newPin
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get Card Transactions
router.get('/:cardId/transactions', verifyToken, async (req, res, next) => {
    try {
        const transactions = await cardService.getCardTransactions(
            req.user.id,
            req.params.cardId,
            req.query
        );
        res.json(transactions);
    } catch (error) {
        next(error);
    }
});

// Get Card Statement
router.get('/:cardId/statement', verifyToken, async (req, res, next) => {
    try {
        const statement = await cardService.getCardStatement(
            req.user.id,
            req.params.cardId,
            req.query
        );
        res.json(statement);
    } catch (error) {
        next(error);
    }
});

// Get Card Rewards
router.get('/:cardId/rewards', verifyToken, async (req, res, next) => {
    try {
        const rewards = await cardService.getCardRewards(
            req.user.id,
            req.params.cardId
        );
        res.json(rewards);
    } catch (error) {
        next(error);
    }
});

// Redeem Rewards
router.post('/:cardId/rewards/redeem', verifyToken, async (req, res, next) => {
    try {
        const result = await cardService.redeemRewards(
            req.user.id,
            req.params.cardId,
            req.body
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Update Card Limits
router.put('/:cardId/limits', verifyToken, async (req, res, next) => {
    try {
        const result = await cardService.updateCardLimits(
            req.user.id,
            req.params.cardId,
            req.body
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 