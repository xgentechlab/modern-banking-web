const { AppError } = require('../middleware/error-handler');
const { logger } = require('../utils/logger');
const { transfers } = require('../data/transfers.json');
const { transactions } = require('../data/transactions.json');
const { accounts } = require('../data/user-accounts.json');

// Helper function to validate account ownership
const validateAccountOwnership = (userId, accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) {
        throw new AppError('Account not found', 404);
    }
    if (account.userId !== userId) {
        throw new AppError('Unauthorized access to account', 403);
    }
    return account;
};

// Helper function to validate transfer amount
const validateTransferAmount = (fromAccount, amount) => {
    if (amount <= 0) {
        throw new AppError('Transfer amount must be greater than 0', 400);
    }
    if (fromAccount.balance < amount) {
        throw new AppError('Insufficient funds', 400);
    }
};

// Initiate immediate transfer
const initiateTransfer = async (userId, transferData) => {
    const fromAccount = validateAccountOwnership(userId, transferData.fromAccountId);
    validateTransferAmount(fromAccount, transferData.amount);

    const newTransfer = {
        id: `TRF${String(transfers.length + 1).padStart(3, '0')}`,
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: transferData.amount,
        currency: transferData.currency || 'USD',
        type: 'domestic',
        status: 'completed',
        description: transferData.description,
        scheduledDate: null,
        executedDate: new Date().toISOString(),
        reference: transferData.reference || `TRF-${Date.now()}`,
        fees: 0,
        exchangeRate: null
    };

    logger.info(`Transfer initiated: ${newTransfer.id}`);
    return {
        success: true,
        transfer: newTransfer
    };
};

// Schedule future transfer
const scheduleTransfer = async (userId, transferData) => {
    const fromAccount = validateAccountOwnership(userId, transferData.fromAccountId);
    validateTransferAmount(fromAccount, transferData.amount);

    if (!transferData.scheduledDate) {
        throw new AppError('Scheduled date is required', 400);
    }

    const scheduledDate = new Date(transferData.scheduledDate);
    if (scheduledDate <= new Date()) {
        throw new AppError('Scheduled date must be in the future', 400);
    }

    const newTransfer = {
        id: `TRF${String(transfers.length + 1).padStart(3, '0')}`,
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: transferData.amount,
        currency: transferData.currency || 'USD',
        type: 'domestic',
        status: 'scheduled',
        description: transferData.description,
        scheduledDate: scheduledDate.toISOString(),
        executedDate: null,
        reference: transferData.reference || `TRF-${Date.now()}`,
        fees: 0,
        exchangeRate: null
    };

    logger.info(`Transfer scheduled: ${newTransfer.id}`);
    return {
        success: true,
        transfer: newTransfer
    };
};

// Get transfer status
const getTransferStatus = async (userId, transferId) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) {
        throw new AppError('Transfer not found', 404);
    }

    // Verify ownership
    validateAccountOwnership(userId, transfer.fromAccountId);

    return {
        success: true,
        status: transfer.status,
        transfer
    };
};

// Cancel scheduled transfer
const cancelScheduledTransfer = async (userId, transferId) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) {
        throw new AppError('Transfer not found', 404);
    }

    // Verify ownership
    validateAccountOwnership(userId, transfer.fromAccountId);

    if (transfer.status !== 'scheduled') {
        throw new AppError('Only scheduled transfers can be cancelled', 400);
    }

    logger.info(`Transfer cancelled: ${transferId}`);
    return {
        success: true,
        message: 'Transfer cancelled successfully'
    };
};

// Initiate domestic transfer
const initiateDomesticTransfer = async (userId, transferData) => {
    const fromAccount = validateAccountOwnership(userId, transferData.fromAccountId);
    validateTransferAmount(fromAccount, transferData.amount);

    const newTransfer = {
        id: `TRF${String(transfers.length + 1).padStart(3, '0')}`,
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: transferData.amount,
        currency: transferData.currency || 'USD',
        type: 'domestic',
        status: 'completed',
        description: transferData.description,
        scheduledDate: null,
        executedDate: new Date().toISOString(),
        reference: transferData.reference || `DOM-${Date.now()}`,
        fees: 0,
        exchangeRate: null
    };

    logger.info(`Domestic transfer initiated: ${newTransfer.id}`);
    return {
        success: true,
        transfer: newTransfer
    };
};

// Initiate international transfer
const initiateInternationalTransfer = async (userId, transferData) => {
    const fromAccount = validateAccountOwnership(userId, transferData.fromAccountId);
    validateTransferAmount(fromAccount, transferData.amount + (transferData.fees || 25)); // Include fees

    if (!transferData.swiftCode) {
        throw new AppError('SWIFT code is required for international transfers', 400);
    }

    const newTransfer = {
        id: `TRF${String(transfers.length + 1).padStart(3, '0')}`,
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: transferData.amount,
        currency: transferData.currency,
        type: 'international',
        status: 'processing',
        description: transferData.description,
        scheduledDate: null,
        executedDate: new Date().toISOString(),
        reference: transferData.reference || `INT-${Date.now()}`,
        fees: transferData.fees || 25,
        exchangeRate: transferData.exchangeRate,
        swiftCode: transferData.swiftCode,
        recipientBank: transferData.recipientBank,
        recipientCountry: transferData.recipientCountry
    };

    logger.info(`International transfer initiated: ${newTransfer.id}`);
    return {
        success: true,
        transfer: newTransfer
    };
};

// Get user's transfers
const getUserTransfers = async (userId , queryParams) => {
    const userAccounts = accounts.filter(acc => acc.userId === userId).map(acc => acc.id);
    const userTransfers = transfers.filter(t => 
        userAccounts.includes(t.fromAccountId) || userAccounts.includes(t.toAccountId)
    );

    return {
        success: true,
        transfers: userTransfers,
        pagination: {
            page: queryParams.page || 1,
            limit: queryParams.limit || 20,
            totalRecords: userTransfers.length,
            totalPages: Math.ceil(userTransfers.length / (queryParams.limit || 20))
        }
    };
};


const getUserRecentTransfersByAccountNumber = async (userId, accountNumber, queryParams) => {
    const limit = queryParams.limit || 20;
    const offset =0;
    const accountTransactions = transactions.filter(t => t.fromAccountId === accountNumber || t.toAccountId === accountNumber).sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)).slice(offset, offset + limit);
    
    return {
        success: true,
        transfers: accountTransactions,
        pagination: {
            page: queryParams.page || 1,
            limit: queryParams.limit || 20,
        }
}
}

module.exports = {
    initiateTransfer,
    scheduleTransfer,
    getTransferStatus,
    cancelScheduledTransfer,
    initiateDomesticTransfer,
    initiateInternationalTransfer,
    getUserTransfers,
    getUserRecentTransfersByAccountNumber
}; 