const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth-middleware');
const transferService = require('../services/transfer-service');

// Initiate Fund Transfer
router.post('/immediate', verifyToken, async (req, res, next) => {
    try {
        const transfer = await transferService.initiateTransfer(req.user.id, req.body);
        res.status(201).json(transfer);
    } catch (error) {
        next(error);
    }
});

// Schedule Future Transfer
router.post('/schedule', verifyToken, async (req, res, next) => {
    try {
        const transfer = await transferService.scheduleTransfer(req.user.id, req.body);
        res.status(201).json(transfer);
    } catch (error) {
        next(error);
    }
});

// Get Transfer Status
router.get('/:transferId/status', verifyToken, async (req, res, next) => {
    try {
        const status = await transferService.getTransferStatus(req.user.id, req.params.transferId);
        res.json(status);
    } catch (error) {
        next(error);
    }
});

// Cancel Scheduled Transfer
router.delete('/scheduled/:transferId', verifyToken, async (req, res, next) => {
    try {
        const result = await transferService.cancelScheduledTransfer(req.user.id, req.params.transferId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Domestic Transfer
router.post('/domestic', verifyToken, async (req, res, next) => {
    try {
        const transfer = await transferService.initiateDomesticTransfer(req.user.id, req.body);
        res.status(201).json(transfer);
    } catch (error) {
        next(error);
    }
});

// International Transfer
router.post('/international', verifyToken, async (req, res, next) => {
    try {
        const transfer = await transferService.initiateInternationalTransfer(req.user.id, req.body);
        res.status(201).json(transfer);
    } catch (error) {
        next(error);
    }
});

// Get User's Transfers
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const transfers = await transferService.getUserTransfers(req.user.id, req.query);
        res.json(transfers);
    } catch (error) {
        next(error);
    }
});

router.get('/:userId/:accountNumber', verifyToken, async (req, res, next) => {
    try {
        const transfers = await transferService.getUserRecentTransfersByAccountNumber(req.params.userId, req.params.accountNumber, req.query);
        res.json(transfers);
    } catch (error) {
        next(error);
    }
});
module.exports = router; 