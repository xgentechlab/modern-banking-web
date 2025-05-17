const { AppError } = require('../middleware/error-handler');
const { logger } = require('../utils/logger');
const { beneficiaries } = require('../data/beneficiaries.json');

// Helper function to validate beneficiary ownership
const validateBeneficiaryOwnership = (userId, beneficiaryId) => {
    const beneficiary = beneficiaries.find(b => b.id === beneficiaryId);
    if (!beneficiary) {
        throw new AppError('Beneficiary not found', 404);
    }
    if (beneficiary.userId !== userId) {
        throw new AppError('Unauthorized access to beneficiary', 403);
    }
    return beneficiary;
};

// Helper function to validate beneficiary data
const validateBeneficiaryData = (data) => {
    if (!data.name || !data.accountNumber || !data.bankName) {
        throw new AppError('Name, account number, and bank name are required', 400);
    }

    if (data.type === 'international' && !data.swiftCode) {
        throw new AppError('SWIFT code is required for international beneficiaries', 400);
    }
};

// Get all beneficiaries for a user
const getBeneficiaries = async (userId, searchValue) => {
    var userBeneficiaries = beneficiaries.filter(b => b.userId.toString() === userId);
    let filteredBeneficiaries = [];
    if (searchValue) {
        filteredBeneficiaries = userBeneficiaries.filter(b => b.name.toLowerCase().includes(searchValue.toLowerCase()));
    }
    // If search value provided, also search in nickname, email, phone and account number
    if (searchValue && filteredBeneficiaries.length === 0) {
        const searchTerm = searchValue.toLowerCase();
        filteredBeneficiaries = userBeneficiaries.filter(b => 
            b.name.toLowerCase().includes(searchTerm) ||
            (b.nickname && b.nickname.toLowerCase().includes(searchTerm)) ||
            (b.email && b.email.toLowerCase().includes(searchTerm)) ||
            (b.phone && b.phone.includes(searchTerm)) ||
            b.accountNumber.includes(searchTerm)
        );
    }
    return {
        success: true,
        beneficiaries: filteredBeneficiaries.length === 0 ? userBeneficiaries : filteredBeneficiaries
    };
};

// Add a new beneficiary
const addBeneficiary = async (userId, beneficiaryData) => {
    validateBeneficiaryData(beneficiaryData);

    const newBeneficiary = {
        id: `BEN${String(beneficiaries.length + 1).padStart(3, '0')}`,
        userId,
        ...beneficiaryData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        verificationStatus: 'pending',
        verifiedAt: null
    };

    logger.info(`New beneficiary created: ${newBeneficiary.id} for user: ${userId}`);
    
    // In a real application, this would trigger a verification process
    // (e.g., sending OTP to beneficiary's email/phone)
    
    return {
        success: true,
        beneficiary: newBeneficiary,
        message: 'Beneficiary added successfully. Verification required.'
    };
};

// Delete a beneficiary
const deleteBeneficiary = async (userId, beneficiaryId) => {
    const beneficiary = validateBeneficiaryOwnership(userId, beneficiaryId);

    // In a real application, you might want to implement soft delete
    logger.info(`Beneficiary deleted: ${beneficiaryId} for user: ${userId}`);
    
    return {
        success: true,
        message: 'Beneficiary deleted successfully'
    };
};

// Update beneficiary information
const updateBeneficiary = async (userId, beneficiaryId, updateData) => {
    const beneficiary = validateBeneficiaryOwnership(userId, beneficiaryId);

    // Prevent updating critical fields that should require re-verification
    const protectedFields = ['accountNumber', 'bankCode', 'swiftCode', 'iban'];
    const hasProtectedUpdates = protectedFields.some(field => updateData[field] !== undefined);

    if (hasProtectedUpdates) {
        throw new AppError('Updating account/bank details requires re-verification', 400);
    }

    const updatedBeneficiary = {
        ...beneficiary,
        ...updateData,
        lastUpdated: new Date().toISOString()
    };

    logger.info(`Beneficiary updated: ${beneficiaryId} for user: ${userId}`);
    
    return {
        success: true,
        beneficiary: updatedBeneficiary
    };
};

// Verify a beneficiary
const verifyBeneficiary = async (userId, beneficiaryId, verificationCode) => {
    const beneficiary = validateBeneficiaryOwnership(userId, beneficiaryId);

    if (beneficiary.verificationStatus === 'verified') {
        throw new AppError('Beneficiary is already verified', 400);
    }

    // In a real application, validate the verification code
    if (!verificationCode || verificationCode !== '123456') { // Example verification code
        throw new AppError('Invalid verification code', 400);
    }

    const verifiedBeneficiary = {
        ...beneficiary,
        status: 'active',
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };

    logger.info(`Beneficiary verified: ${beneficiaryId} for user: ${userId}`);
    
    return {
        success: true,
        beneficiary: verifiedBeneficiary,
        message: 'Beneficiary verified successfully'
    };
};

// Get beneficiary details
const getBeneficiaryDetails = async (userId, beneficiaryId) => {
    const beneficiary = validateBeneficiaryOwnership(userId, beneficiaryId);
    
    return {
        success: true,
        beneficiary
    };
};

module.exports = {
    getBeneficiaries,
    addBeneficiary,
    deleteBeneficiary,
    updateBeneficiary,
    verifyBeneficiary,
    getBeneficiaryDetails
}; 