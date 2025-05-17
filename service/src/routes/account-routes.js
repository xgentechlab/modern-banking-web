const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth-middleware');
const accountService = require('../services/account-service');

// Get Types of Accounts
router.get('/types', verifyToken, async (req, res, next) => {
    try {
        const accountTypes = await accountService.getAccountTypes();
        res.json(accountTypes);
    } catch (error) {
        next(error);
    }
});

// Get User's Accounts
router.get('/user', verifyToken, async (req, res, next) => {
    try {
        const accounts = await accountService.getUserAccounts(req.user.userid);
        res.json(accounts);
    } catch (error) {
        next(error);
    }
});

// Get Accounts by User ID (Admin only)
router.get('/user/:userId', verifyToken, async (req, res, next) => {
    try {
        // Check if the requesting user is an admin
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ 
        //         success: false, 
        //         message: 'Access denied. Admin privileges required.' 
        //     });
        // }
        const {accountNumber, accountType, accountStatus} = req.query;
        const accounts = await accountService.getAccountsByUserId(req.params.userId, accountNumber, accountType, accountStatus);
        res.json(accounts);
    } catch (error) {
        next(error);
    }
});

// Add New Account
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const newAccount = await accountService.createAccount(req.user.id, req.body);
        res.status(201).json(newAccount);
    } catch (error) {
        next(error);
    }
});

// Delete Account
router.delete('/:accountId', verifyToken, async (req, res, next) => {
    try {
        await accountService.deleteAccount(req.user.id, req.params.accountId);
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Update Account
router.put('/:accountId', verifyToken, async (req, res, next) => {
    try {
        const updatedAccount = await accountService.updateAccount(
            req.user.id,
            req.params.accountId,
            req.body
        );
        res.json(updatedAccount);
    } catch (error) {
        next(error);
    }
});

// Get Account Details
router.get('/:userId/:accountId', verifyToken, async (req, res, next) => {
    try {
        const account = await accountService.getAccountDetails(
            req.params.userId,
            req.params.accountId
        );
        res.json(account);
    } catch (error) {
        next(error);
    }
});

// Get Account Balance
router.get('/:accountId/balance', verifyToken, async (req, res, next) => {
    try {
        const balance = await accountService.getAccountBalance(
            req.user.id,
            req.params.accountId
        );
        res.json(balance);
    } catch (error) {
        next(error);
    }
});

// Get Mini Statement
router.get('/:accountId/mini-statement', verifyToken, async (req, res, next) => {
    try {
        const statement = await accountService.getMiniStatement(
            req.user.id,
            req.params.accountId
        );
        res.json(statement);
    } catch (error) {
        next(error);
    }
});

// Get Full Statement
router.get('/:accountId/statement', verifyToken, async (req, res, next) => {
    try {
        const statement = await accountService.getFullStatement(
            req.user.id,
            req.params.accountId,
            req.query
        );
        res.json(statement);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 