const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth-middleware');
const beneficiaryService = require('../services/beneficiary-service');

// Get List of Beneficiaries
router.get('/', async (req, res, next) => {
    try {
        let {userId, searchValue } = req.query
        const beneficiaries = await beneficiaryService.getBeneficiaries(userId, searchValue);
        res.json(beneficiaries);
    } catch (error) {
        next(error);
    }
});

// Add a New Beneficiary
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const beneficiary = await beneficiaryService.addBeneficiary(req.user.id, req.body);
        res.status(201).json(beneficiary);
    } catch (error) {
        next(error);
    }
});

// Delete a Beneficiary
router.delete('/:beneficiaryId', verifyToken, async (req, res, next) => {
    try {
        const result = await beneficiaryService.deleteBeneficiary(
            req.user.id,
            req.params.beneficiaryId
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Update Beneficiary Information
router.put('/:beneficiaryId', verifyToken, async (req, res, next) => {
    try {
        const beneficiary = await beneficiaryService.updateBeneficiary(
            req.user.id,
            req.params.beneficiaryId,
            req.body
        );
        res.json(beneficiary);
    } catch (error) {
        next(error);
    }
});

// Verify Beneficiary
router.post('/:beneficiaryId/verify', verifyToken, async (req, res, next) => {
    try {
        const result = await beneficiaryService.verifyBeneficiary(
            req.user.id,
            req.params.beneficiaryId,
            req.body.verificationCode
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get Beneficiary Details
router.get('/:beneficiaryId', verifyToken, async (req, res, next) => {
    try {
        const beneficiary = await beneficiaryService.getBeneficiaryDetails(
            req.user.id,
            req.params.beneficiaryId
        );
        res.json(beneficiary);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 