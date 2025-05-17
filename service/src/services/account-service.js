const { AppError } = require('../middleware/error-handler');
const { logger } = require('../utils/logger');
const { accountTypes } = require('../data/account-types.json');
const { accounts } = require('../data/user-accounts.json');
const fs = require('fs').promises;
const path = require('path');
// const { v4: uuidv4 } = require('uuid');
const { ValidationError } = require('../utils/errors');

// Get all account types
const getAccountTypes = async () => {
    return {
        success: true,
        accountTypes
    };
};

// Get user's accounts
const getUserAccounts = async (userId) => {
    const userAccounts = accounts.filter(account => account.userId === userId);
    return {
        success: true,
        accounts: userAccounts
    };
};

// Create new account
const createAccount = async (userId, accountData) => {
    // Validate account type
    const accountType = accountTypes.find(type => type.id === accountData.accountType);
    if (!accountType) {
        throw new AppError('Invalid account type', 400);
    }

    // Check minimum balance requirement
    if (accountData.initialDeposit < accountType.minBalance) {
        throw new AppError(`Minimum balance requirement not met. Required: ${accountType.minBalance}`, 400);
    }

    // Generate new account
    const newAccount = {
        id: `ACC${String(accounts.length + 1).padStart(3, '0')}`,
        userId,
        accountType: accountData.accountType,
        accountNumber: Math.random().toString().slice(2, 12), // Simple account number generation
        balance: accountData.initialDeposit,
        currency: accountData.currency || 'USD',
        status: 'active',
        openedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        branch: accountData.branch || 'MAIN001',
        nominees: accountData.nominees || []
    };

    logger.info(`New account created: ${newAccount.id} for user: ${userId}`);
    return {
        success: true,
        account: newAccount
    };
};

// Delete account
const deleteAccount = async (userId, accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        throw new AppError('Account not found', 404);
    }

    if (account.userId !== userId) {
        throw new AppError('Unauthorized access to account', 403);
    }

    if (account.balance > 0) {
        throw new AppError('Cannot delete account with positive balance', 400);
    }

    logger.info(`Account deleted: ${accountId} for user: ${userId}`);
    return {
        success: true,
        message: 'Account deleted successfully'
    };
};

// Update account
const updateAccount = async (userId, accountId, updateData) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        throw new AppError('Account not found', 404);
    }

    if (account.userId !== userId) {
        throw new AppError('Unauthorized access to account', 403);
    }

    // In a real application, you would update the account in the database
    const updatedAccount = {
        ...account,
        ...updateData,
        lastUpdated: new Date().toISOString()
    };

    logger.info(`Account updated: ${accountId} for user: ${userId}`);
    return {
        success: true,
        account: updatedAccount
    };
};

// Get account details
const getAccountDetails = async (userId, accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        throw new AppError('Account not found', 404);
    }

    if (account.userId != userId) {
        throw new AppError('Unauthorized access to account', 403);
    }

    return {
        success: true,
        account
    };
};

// Get account balance
const getAccountBalance = async (userId, accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        throw new AppError('Account not found', 404);
    }

    if (account.userId !== userId) {
        throw new AppError('Unauthorized access to account', 403);
    }

    return {
        success: true,
        balance: account.balance,
        currency: account.currency,
        lastUpdated: account.lastUpdated
    };
};

// Get mini statement (last 10 transactions)
const getMiniStatement = async (userId, accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        throw new AppError('Account not found', 404);
    }

    if (account.userId !== userId) {
        throw new AppError('Unauthorized access to account', 403);
    }

    // In a real application, you would fetch this from a transactions table
    return {
        success: true,
        accountId,
        transactions: [] // Would contain last 10 transactions
    };
};

// Get full statement
const getFullStatement = async (userId, accountId, queryParams) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        throw new AppError('Account not found', 404);
    }

    if (account.userId !== userId) {
        throw new AppError('Unauthorized access to account', 403);
    }

    // In a real application, you would fetch this from a transactions table
    // with pagination and filtering based on queryParams
    return {
        success: true,
        accountId,
        transactions: [], // Would contain paginated transactions
        pagination: {
            page: queryParams.page || 1,
            limit: queryParams.limit || 20,
            totalPages: 0,
            totalRecords: 0
        }
    };
};

class AccountService {
    constructor() {
        this.accountsPath = path.join(__dirname, '../data/user-accounts.json');
    }

    async readAccounts() {
        const data = await fs.readFile(this.accountsPath, 'utf8');
        return JSON.parse(data);
    }

    async getAccountsByUserId(userId) {
        const { accounts } = await this.readAccounts();
        const userAccounts = accounts.filter(account => account.userId === parseInt(userId));
        
        if (userAccounts.length === 0) {
            throw new ValidationError('No accounts found for the specified user ID');
        }

        // Enhance account details with additional information
        return userAccounts.map(account => ({
            ...account,
            accountTypeName: this.getAccountTypeName(account.accountType),
            formattedBalance: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: account.currency
            }).format(account.balance),
            accountAge: this.calculateAccountAge(account.openedDate)
        }));
    }

    getAccountTypeName(typeCode) {
        const types = {
            'SAV': 'Savings Account',
            'CHK': 'Checking Account',
            'FD': 'Fixed Deposit'
        };
        return types[typeCode] || typeCode;
    }

    calculateAccountAge(openedDate) {
        const opened = new Date(openedDate);
        const now = new Date();
        const diffTime = Math.abs(now - opened);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} days`;
        if (diffDays < 365) return `${Math.floor(diffDays/30)} months`;
        return `${Math.floor(diffDays/365)} years`;
    }
}

const readAccounts = async () => {
    const data = await fs.readFile(path.join(__dirname, '../data/user-accounts.json'), 'utf8');
    return JSON.parse(data);
}

const getAccountTypeName = (typeCode) => {
    const types = {
        'SAV': 'Savings Account',
        'CHK': 'Checking Account',
        'FD': 'Fixed Deposit',
        'CUR': 'Current Account'
    };
    return types[typeCode] || typeCode;
}


const getAccountsByUserId = async (userId, accountNumber, accountType, accountStatus) => {
    const { accounts } = await readAccounts();
    var userAccounts = accounts.filter(account => account.userId === parseInt(userId));
    if (accountNumber) {
        userAccounts = userAccounts.filter(account => account.accountNumber == accountNumber);
    }
    if (accountType) {
        userAccounts = userAccounts.filter(account => account.accountType == accountType);
    }   
    if (accountStatus) {
        userAccounts = userAccounts.filter(account => account.status == accountStatus);
    }
    
    if (userAccounts.length === 0) {
        throw new ValidationError('No accounts found for the specified user ID');
    }

    // Enhance account details with additional information
    return userAccounts.map(account => ({
        ...account,
        accountTypeName: getAccountTypeName(account.accountType),
        formattedBalance: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: account.currency
        }).format(account.balance),
        
    }));
}


module.exports = {
    getAccountTypes,
    getUserAccounts,
    createAccount,
    deleteAccount,
    updateAccount,
    getAccountDetails,
    getAccountBalance,
    getMiniStatement,
    getFullStatement,
    getAccountsByUserId
}; 