const fs = require('fs').promises;
const path = require('path');
const { NotFoundError } = require('../utils/errors');
const { logger } = require('../utils/logger');

class AnalyticsService {
    constructor() {
        this.transactionsPath = path.join(__dirname, '../data/transactions.json');
        this.accountsPath = path.join(__dirname, '../data/user-accounts.json');
        this.cardsPath = path.join(__dirname, '../data/cards.json');
    }

    async getFilteredTransactions(userId, filters) {
        try {
            // Read transactions data
            const transactionsData = await fs.readFile(this.transactionsPath, 'utf8');
            const transactions = JSON.parse(transactionsData).transactions;

            // Get user's accounts
            const accountsData = await fs.readFile(this.accountsPath, 'utf8');
            const accounts = JSON.parse(accountsData).accounts;
            const userAccountIds = accounts
                .filter(acc => acc.userId.toString() === userId.toString())
                .map(acc => acc.id);

            // Get user's cards
            const cardsData = await fs.readFile(this.cardsPath, 'utf8');
            const cards = JSON.parse(cardsData).cards;
            const userCardIds = cards
                .filter(card => card.userId.toString() === userId.toString())
                .map(card => card.id);

            // Filter transactions
            let filteredTransactions = transactions.filter(txn => {
                // Check if transaction belongs to user's accounts or cards
                const isUserTransaction = 
                    userAccountIds.includes(txn.fromAccountId) || 
                    userAccountIds.includes(txn.toAccountId) ||
                    (txn.cardId && userCardIds.includes(txn.cardId));

                if (!isUserTransaction) return false;

                // Apply date filters
                if (filters.startDate && new Date(txn.transactionDate) < new Date(filters.startDate)) return false;
                if (filters.endDate && new Date(txn.transactionDate) > new Date(filters.endDate)) return false;

                // Apply other filters
                if (filters.transactionType && txn.transactionType.toLowerCase() !== filters.transactionType.toLowerCase()) return false;
                if (filters.channel && txn.channel !== filters.channel) return false;
                if (filters.category && txn.category !== filters.category) return false;
                if (filters.accountId && txn.fromAccountId !== filters.accountId && txn.toAccountId !== filters.accountId) return false;
                if (filters.cardId && txn.cardId !== filters.cardId) return false;
                if (filters.beneficiaryId && txn.beneficiaryId !== filters.beneficiaryId) return false;

                return true;
            });

            // Transform transactions for response
            return filteredTransactions.map(txn => ({
                transactionId: txn.id,
                date: new Date(txn.transactionDate).toISOString().split('T')[0],
                amount: txn.amount,
                transactionType: txn.transactionType.toLowerCase(),
                channel: txn.channel,
                category: txn.type, // Using transaction type as category for now
                accountId: txn.fromAccountId || txn.toAccountId,
                cardId: txn.cardId || null,
                beneficiaryId: txn.beneficiaryId || null,
                description: txn.description
            }));

        } catch (error) {
            logger.error(`Error getting filtered transactions: ${error.message}`);
            throw error;
        }
    }

    async getTransactionAnalytics(userId, filters) {
        try {
            const transactions = await this.getFilteredTransactions(userId, filters);
            
            // Calculate analytics
            const analytics = {
                totalTransactions: transactions.length,
                totalAmount: transactions.reduce((sum, txn) => sum + txn.amount, 0),
                averageTransactionValue: 0,
                transactionsByType: {},
                transactionsByChannel: {},
                transactionsByCategory: {},
                monthlyTrends: {}
            };

            // Calculate average
            if (analytics.totalTransactions > 0) {
                analytics.averageTransactionValue = Number(
                    (analytics.totalAmount / analytics.totalTransactions).toFixed(2)
                );
            }

            // Group by type, channel, and category
            transactions.forEach(txn => {
                // By type
                analytics.transactionsByType[txn.transactionType] = 
                    (analytics.transactionsByType[txn.transactionType] || 0) + 1;

                // By channel
                analytics.transactionsByChannel[txn.channel] = 
                    (analytics.transactionsByChannel[txn.channel] || 0) + 1;

                // By category
                analytics.transactionsByCategory[txn.category] = 
                    (analytics.transactionsByCategory[txn.category] || 0) + 1;

                // Monthly trends
                const month = txn.date.substring(0, 7); // YYYY-MM
                if (!analytics.monthlyTrends[month]) {
                    analytics.monthlyTrends[month] = {
                        count: 0,
                        amount: 0
                    };
                }
                analytics.monthlyTrends[month].count++;
                analytics.monthlyTrends[month].amount += txn.amount;
            });

            return analytics;

        } catch (error) {
            logger.error(`Error getting transaction analytics: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new AnalyticsService(); 