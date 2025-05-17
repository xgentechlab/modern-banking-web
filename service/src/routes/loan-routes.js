const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth-middleware');
const loanService = require('../services/loan-service');

// Get Available Loan Products
router.get('/products', verifyToken, async (req, res, next) => {
    try {
        const products = await loanService.getLoanProducts();
        res.json(products);
    } catch (error) {
        next(error);
    }
});

// Get Loan Product Details
router.get('/products/:productId', verifyToken, async (req, res, next) => {
    try {
        const product = await loanService.getLoanProductDetails(req.params.productId);
        res.json(product);
    } catch (error) {
        next(error);
    }
});

// Apply for a Loan
router.post('/apply', verifyToken, async (req, res, next) => {
    try {
        const application = await loanService.applyForLoan(req.user.id, req.body);
        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
});

// Get User's Loans
router.get('/user/:userId', verifyToken, async (req, res, next) => {
    try {
        let {loanType} = req.query;
        const loans = await loanService.getUserLoans(req.params.userId, loanType);
        res.json(loans);
    } catch (error) {
        next(error);
    }
});

// Get Loan Details
router.get('/details/:loanId', verifyToken, async (req, res, next) => {
    try {
        const loan = await loanService.getLoanDetails( req.params.loanId);
        res.json(loan);
    } catch (error) {
        next(error);
    }
});

// Get Loan Schedule
router.get('/:loanId/schedule', verifyToken, async (req, res, next) => {
    try {
        const schedule = await loanService.getLoanSchedule("XXX", req.params.loanId);
        res.json(schedule);
    } catch (error) {
        next(error);
    }
});

// Make Loan Payment
router.post('/:loanId/payment', verifyToken, async (req, res, next) => {
    try {
        const payment = await loanService.makeLoanPayment(
            req.user.id,
            req.params.loanId,
            req.body
        );
        res.status(201).json(payment);
    } catch (error) {
        next(error);
    }
});

// Get Loan Statements
router.get('/:loanId/statements', verifyToken, async (req, res, next) => {
    try {
        const statements = await loanService.getLoanStatements(
            req.user.id,
            req.params.loanId,
            req.query
        );
        res.json(statements);
    } catch (error) {
        next(error);
    }
});

// Request Loan Closure
router.post('/:loanId/closure', verifyToken, async (req, res, next) => {
    try {
        const closure = await loanService.requestLoanClosure(req.user.id, req.params.loanId);
        res.json(closure);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 