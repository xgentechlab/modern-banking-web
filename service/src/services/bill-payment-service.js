const { AppError } = require('../middleware/error-handler');
const { logger } = require('../utils/logger');
const { billers, registeredBillers, billPayments } = require('../data/billers.json');

// Helper function to validate registered biller ownership
const validateRegisteredBillerOwnership = (userId, registeredBillerId) => {
    const biller = registeredBillers.find(b => b.id === registeredBillerId);
    if (!biller) {
        throw new AppError('Registered biller not found', 404);
    }
    if (biller.userId !== userId) {
        throw new AppError('Unauthorized access to registered biller', 403);
    }
    return biller;
};

// Get all billers with optional filtering
const getBillers = async (queryParams) => {
    let filteredBillers = billers.filter(biller => biller.status === 'active');

    if (queryParams.category) {
        filteredBillers = filteredBillers.filter(
            biller => biller.category === queryParams.category
        );
    }

    return {
        success: true,
        billers: filteredBillers
    };
};

// Get biller details
const getBillerDetails = async (billerId) => {
    const biller = billers.find(b => b.id === billerId);
    if (!biller) {
        throw new AppError('Biller not found', 404);
    }
    return {
        success: true,
        biller
    };
};

// Register a new biller
const registerBiller = async (userId, registrationData) => {
    const biller = billers.find(b => b.id === registrationData.billerId);
    if (!biller) {
        throw new AppError('Biller not found', 404);
    }

    // Validate required fields
    for (const field of biller.fields) {
        if (field.required && !registrationData.fields[field.name]) {
            throw new AppError(`${field.label} is required`, 400);
        }
        if (field.validation && registrationData.fields[field.name]) {
            const regex = new RegExp(field.validation);
            if (!regex.test(registrationData.fields[field.name])) {
                throw new AppError(`Invalid ${field.label} format`, 400);
            }
        }
    }

    const newRegistration = {
        id: `RB${String(registeredBillers.length + 1).padStart(3, '0')}`,
        userId,
        billerId: registrationData.billerId,
        nickname: registrationData.nickname || biller.name,
        status: 'active',
        autoPayEnabled: false,
        fields: registrationData.fields,
        createdAt: new Date().toISOString(),
        lastUsed: null
    };

    logger.info(`New biller registered: ${newRegistration.id} for user: ${userId}`);

    return {
        success: true,
        registeredBiller: newRegistration
    };
};

// Get user's registered billers
const getRegisteredBillers = async (userId) => {
    const userBillers = registeredBillers.filter(biller => biller.userId === userId);
    return {
        success: true,
        registeredBillers: userBillers
    };
};

// Update registered biller
const updateRegisteredBiller = async (userId, registeredBillerId, updateData) => {
    const registeredBiller = validateRegisteredBillerOwnership(userId, registeredBillerId);
    const biller = billers.find(b => b.id === registeredBiller.billerId);

    // Validate fields if updating
    if (updateData.fields) {
        for (const field of biller.fields) {
            if (field.required && !updateData.fields[field.name]) {
                throw new AppError(`${field.label} is required`, 400);
            }
            if (field.validation && updateData.fields[field.name]) {
                const regex = new RegExp(field.validation);
                if (!regex.test(updateData.fields[field.name])) {
                    throw new AppError(`Invalid ${field.label} format`, 400);
                }
            }
        }
    }

    const updatedBiller = {
        ...registeredBiller,
        nickname: updateData.nickname || registeredBiller.nickname,
        fields: updateData.fields || registeredBiller.fields
    };

    logger.info(`Registered biller updated: ${registeredBillerId}`);

    return {
        success: true,
        registeredBiller: updatedBiller
    };
};

// Delete registered biller
const deleteRegisteredBiller = async (userId, registeredBillerId) => {
    validateRegisteredBillerOwnership(userId, registeredBillerId);

    logger.info(`Registered biller deleted: ${registeredBillerId}`);

    return {
        success: true,
        message: 'Registered biller deleted successfully'
    };
};

// Fetch bill details
const fetchBill = async (userId, fetchData) => {
    const registeredBiller = validateRegisteredBillerOwnership(userId, fetchData.registeredBillerId);
    const biller = billers.find(b => b.id === registeredBiller.billerId);

    // In a real application, this would make an API call to the biller's system
    const billDetails = {
        billNumber: `BILL${Date.now()}`,
        amount: Math.floor(Math.random() * 5000) + 500,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        billDate: new Date().toISOString(),
        billPeriod: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString()
        }
    };

    // Calculate convenience fee
    let convenienceFee = 0;
    if (biller.convenienceFee.type === 'fixed') {
        convenienceFee = biller.convenienceFee.value;
    } else {
        convenienceFee = Math.min(
            Math.max(
                (billDetails.amount * biller.convenienceFee.value) / 100,
                biller.convenienceFee.min
            ),
            biller.convenienceFee.max
        );
    }

    return {
        success: true,
        bill: {
            ...billDetails,
            convenienceFee,
            totalAmount: billDetails.amount + convenienceFee,
            paymentModes: biller.paymentModes
        }
    };
};

// Pay bill
const payBill = async (userId, paymentData) => {
    const registeredBiller = validateRegisteredBillerOwnership(userId, paymentData.registeredBillerId);
    const biller = billers.find(b => b.id === registeredBiller.billerId);

    if (!paymentData.amount || paymentData.amount <= 0) {
        throw new AppError('Invalid payment amount', 400);
    }

    if (!biller.paymentModes.includes(paymentData.paymentMode)) {
        throw new AppError('Invalid payment mode', 400);
    }

    const payment = {
        id: `BP${String(billPayments.length + 1).padStart(3, '0')}`,
        userId,
        billerId: registeredBiller.billerId,
        registeredBillerId: registeredBiller.id,
        amount: paymentData.amount,
        convenienceFee: paymentData.convenienceFee,
        totalAmount: paymentData.amount + paymentData.convenienceFee,
        status: 'completed',
        paymentMode: paymentData.paymentMode,
        paymentDetails: paymentData.paymentDetails,
        billDetails: {
            billNumber: paymentData.billNumber,
            billDate: paymentData.billDate,
            dueDate: paymentData.dueDate
        },
        paidAt: new Date().toISOString()
    };

    logger.info(`Bill payment processed: ${payment.id}`);

    return {
        success: true,
        payment
    };
};

// Get payment history
const getPaymentHistory = async (userId, queryParams) => {
    const userPayments = billPayments.filter(payment => payment.userId === userId);

    // Apply filters if provided
    let filteredPayments = userPayments;
    if (queryParams.billerId) {
        filteredPayments = filteredPayments.filter(
            payment => payment.billerId === queryParams.billerId
        );
    }
    if (queryParams.status) {
        filteredPayments = filteredPayments.filter(
            payment => payment.status === queryParams.status
        );
    }

    return {
        success: true,
        payments: filteredPayments,
        pagination: {
            page: queryParams.page || 1,
            limit: queryParams.limit || 20,
            totalRecords: filteredPayments.length,
            totalPages: Math.ceil(filteredPayments.length / (queryParams.limit || 20))
        }
    };
};

// Get payment details
const getPaymentDetails = async (userId, paymentId) => {
    const payment = billPayments.find(p => p.id === paymentId);
    if (!payment) {
        throw new AppError('Payment not found', 404);
    }
    if (payment.userId !== userId) {
        throw new AppError('Unauthorized access to payment', 403);
    }

    return {
        success: true,
        payment
    };
};

// Set up auto pay
const setupAutoPay = async (userId, autoPayData) => {
    const registeredBiller = validateRegisteredBillerOwnership(userId, autoPayData.registeredBillerId);

    if (!autoPayData.maxAmount || autoPayData.maxAmount <= 0) {
        throw new AppError('Invalid maximum amount', 400);
    }

    if (!autoPayData.paymentMode) {
        throw new AppError('Payment mode is required', 400);
    }

    const updatedBiller = {
        ...registeredBiller,
        autoPayEnabled: true,
        autoPay: {
            maxAmount: autoPayData.maxAmount,
            paymentMode: autoPayData.paymentMode,
            paymentDetails: autoPayData.paymentDetails
        }
    };

    logger.info(`Auto pay setup for registered biller: ${registeredBiller.id}`);

    return {
        success: true,
        registeredBiller: updatedBiller
    };
};

// Update auto pay
const updateAutoPay = async (userId, registeredBillerId, updateData) => {
    const registeredBiller = validateRegisteredBillerOwnership(userId, registeredBillerId);

    if (!registeredBiller.autoPayEnabled) {
        throw new AppError('Auto pay is not enabled for this biller', 400);
    }

    const updatedBiller = {
        ...registeredBiller,
        autoPay: {
            ...registeredBiller.autoPay,
            ...updateData
        }
    };

    logger.info(`Auto pay updated for registered biller: ${registeredBillerId}`);

    return {
        success: true,
        registeredBiller: updatedBiller
    };
};

// Cancel auto pay
const cancelAutoPay = async (userId, registeredBillerId) => {
    const registeredBiller = validateRegisteredBillerOwnership(userId, registeredBillerId);

    if (!registeredBiller.autoPayEnabled) {
        throw new AppError('Auto pay is not enabled for this biller', 400);
    }

    const updatedBiller = {
        ...registeredBiller,
        autoPayEnabled: false,
        autoPay: null
    };

    logger.info(`Auto pay cancelled for registered biller: ${registeredBillerId}`);

    return {
        success: true,
        registeredBiller: updatedBiller
    };
};

module.exports = {
    getBillers,
    getBillerDetails,
    registerBiller,
    getRegisteredBillers,
    updateRegisteredBiller,
    deleteRegisteredBiller,
    fetchBill,
    payBill,
    getPaymentHistory,
    getPaymentDetails,
    setupAutoPay,
    updateAutoPay,
    cancelAutoPay
}; 