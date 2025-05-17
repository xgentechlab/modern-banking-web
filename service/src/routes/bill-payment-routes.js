const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth-middleware');
const billPaymentService = require('../services/bill-payment-service');

// Get All Billers
router.get('/billers', verifyToken, async (req, res, next) => {
    try {
        const billers = await billPaymentService.getBillers(req.query);
        res.json(billers);
    } catch (error) {
        next(error);
    }
});

// Get Biller Details
router.get('/billers/:billerId', verifyToken, async (req, res, next) => {
    try {
        const biller = await billPaymentService.getBillerDetails(req.params.billerId);
        res.json(biller);
    } catch (error) {
        next(error);
    }
});

// Register a Biller
router.post('/billers/register', verifyToken, async (req, res, next) => {
    try {
        const registration = await billPaymentService.registerBiller(req.user.id, req.body);
        res.status(201).json(registration);
    } catch (error) {
        next(error);
    }
});

// Get User's Registered Billers
router.get('/registered-billers', verifyToken, async (req, res, next) => {
    try {
        const billers = await billPaymentService.getRegisteredBillers(req.user.id);
        res.json(billers);
    } catch (error) {
        next(error);
    }
});

// Update Registered Biller
router.put('/registered-billers/:registeredBillerId', verifyToken, async (req, res, next) => {
    try {
        const biller = await billPaymentService.updateRegisteredBiller(
            req.user.id,
            req.params.registeredBillerId,
            req.body
        );
        res.json(biller);
    } catch (error) {
        next(error);
    }
});

// Delete Registered Biller
router.delete('/registered-billers/:registeredBillerId', verifyToken, async (req, res, next) => {
    try {
        const result = await billPaymentService.deleteRegisteredBiller(
            req.user.id,
            req.params.registeredBillerId
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Fetch Bill
router.post('/fetch-bill', verifyToken, async (req, res, next) => {
    try {
        const bill = await billPaymentService.fetchBill(req.user.id, req.body);
        res.json(bill);
    } catch (error) {
        next(error);
    }
});

// Pay Bill
router.post('/pay', verifyToken, async (req, res, next) => {
    try {
        const payment = await billPaymentService.payBill(req.user.id, req.body);
        res.status(201).json(payment);
    } catch (error) {
        next(error);
    }
});

// Get Payment History
router.get('/history', verifyToken, async (req, res, next) => {
    try {
        const history = await billPaymentService.getPaymentHistory(req.user.id, req.query);
        res.json(history);
    } catch (error) {
        next(error);
    }
});

// Get Payment Details
router.get('/payments/:paymentId', verifyToken, async (req, res, next) => {
    try {
        const payment = await billPaymentService.getPaymentDetails(
            req.user.id,
            req.params.paymentId
        );
        res.json(payment);
    } catch (error) {
        next(error);
    }
});

// Set Up Auto Pay
router.post('/auto-pay', verifyToken, async (req, res, next) => {
    try {
        const autoPay = await billPaymentService.setupAutoPay(req.user.id, req.body);
        res.status(201).json(autoPay);
    } catch (error) {
        next(error);
    }
});

// Update Auto Pay
router.put('/auto-pay/:registeredBillerId', verifyToken, async (req, res, next) => {
    try {
        const autoPay = await billPaymentService.updateAutoPay(
            req.user.id,
            req.params.registeredBillerId,
            req.body
        );
        res.json(autoPay);
    } catch (error) {
        next(error);
    }
});

// Cancel Auto Pay
router.delete('/auto-pay/:registeredBillerId', verifyToken, async (req, res, next) => {
    try {
        const result = await billPaymentService.cancelAutoPay(
            req.user.id,
            req.params.registeredBillerId
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 