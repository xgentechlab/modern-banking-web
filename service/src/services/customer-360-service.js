const fs = require('fs').promises;
const path = require('path');
const { NotFoundError } = require('../utils/errors');
const { logger } = require('../utils/logger');

class Customer360Service {
    constructor() {
        this.usersPath = path.join(__dirname, '../data/users.json');
        this.accountsPath = path.join(__dirname, '../data/user-accounts.json');
        this.cardsPath = path.join(__dirname, '../data/cards.json');
    }

    async getCustomer360Data(userId) {
        try {
            // Get user profile data
            const usersData = await fs.readFile(this.usersPath, 'utf8');
            const users = JSON.parse(usersData).users;
            const user = users.find(u => u.id.toString() == userId);

            if (!user) {
                throw new NotFoundError(`User with ID ${userId} not found`);
            }

            // Get user accounts
            const accountsData = await fs.readFile(this.accountsPath, 'utf8');
            const accounts = JSON.parse(accountsData).accounts;
            const userAccounts = accounts.filter(acc => acc.userId == userId);

            // Get user cards
            const cardsData = await fs.readFile(this.cardsPath, 'utf8');
            const cards = JSON.parse(cardsData).cards;
            const userCards = cards.filter(card => card.userId == userId);

            // Combine all data
            const customer360Data = {
                profile: user,
                accounts: userAccounts,
                cards: userCards
            };

            // Mask sensitive information
            const maskedData = this.maskSensitiveData(customer360Data);
            
            logger.info(`Retrieved 360 data for customer ${userId}`);
            
            return {
                success: true,
                data: maskedData
            };
        } catch (error) {
            logger.error(`Error retrieving customer 360 data: ${error.message}`);
            throw error;
        }
    }

    maskSensitiveData(customer360Data) {
        const masked = JSON.parse(JSON.stringify(customer360Data));

        // Mask profile data
        if (masked.profile) {
            // Mask password
            if (masked.profile.password) {
                masked.profile.password = '********';
            }
            
            // Mask phone numbers
            if (masked.profile.phone) {
                masked.profile.phone = this.maskString(masked.profile.phone, 4);
            }
        }

        // Mask account numbers
        if (masked.accounts) {
            masked.accounts.forEach(account => {
                if (account.accountNumber) {
                    account.accountNumber = this.maskString(account.accountNumber, 4);
                }
            });
        }

        // Mask card data
        if (masked.cards) {
            masked.cards.forEach(card => {
                // Mask card number
                if (card.cardNumber) {
                    card.cardNumber = this.maskString(card.cardNumber, 4);
                }
                // Mask CVV completely
                if (card.cvv) {
                    card.cvv = 'XXX';
                }
            });
        }

        return masked;
    }

    maskString(str, visibleChars = 4) {
        if (!str) return str;
        const visible = str.slice(-visibleChars);
        const masked = 'X'.repeat(str.length - visibleChars);
        return masked + visible;
    }
}

module.exports = new Customer360Service(); 