const { AppError } = require('../middleware/error-handler');
const { logger } = require('../utils/logger');
const { cardProducts } = require('../data/card-products.json');
const { cards, cardTransactions } = require('../data/cards.json');

// Helper function to validate card ownership
const validateCardOwnership = (userId, cardId) => {
    const card = cards.find(c => c.id == cardId);
    if (!card) {
        throw new AppError('Card not found', 404);
    }
    // if (card.userId !== userId) {
    //     throw new AppError('Unauthorized access to card', 403);
    // }
    return card;
};

// Get all available card products
const getCardProducts = async () => {
    const activeProducts = cardProducts.filter(product => product.status === 'active');
    return {
        success: true,
        products: activeProducts
    };
};

// Get card product details
const getCardProductDetails = async (productId) => {
    const product = cardProducts.find(p => p.id === productId);
    if (!product) {
        throw new AppError('Card product not found', 404);
    }
    return {
        success: true,
        product
    };
};

// Apply for a new card
const applyForCard = async (userId, applicationData) => {
    const product = cardProducts.find(p => p.id === applicationData.productId);
    if (!product) {
        throw new AppError('Card product not found', 404);
    }

    // Validate application data
    if (!applicationData.accountId) {
        throw new AppError('Account ID is required', 400);
    }

    // In a real application, validate eligibility criteria
    const newCard = {
        id: `CARD${String(cards.length + 1).padStart(3, '0')}`,
        userId,
        accountId: applicationData.accountId,
        productId: applicationData.productId,
        cardNumber: `xxxx-xxxx-xxxx-${Math.floor(1000 + Math.random() * 9000)}`,
        cardType: product.type,
        nameOnCard: applicationData.nameOnCard.toUpperCase(),
        expiryDate: '12/28', // Example: 5 years validity
        cvv: 'xxx',
        status: 'issued',
        activationStatus: 'pending',
        pinSet: false,
        issuedDate: new Date().toISOString(),
        ...(product.type === 'credit' && {
            creditLimit: product.creditLimit.min,
            availableLimit: product.creditLimit.min,
            statementDate: 1,
            dueDate: 18,
            outstandingAmount: 0,
            minimumDue: 0,
            lastStatementBalance: 0
        }),
        ...(product.type === 'debit' && {
            dailyLimits: {
                withdrawal: product.transactionLimits.daily.withdrawal,
                purchase: product.transactionLimits.daily.purchase
            }
        }),
        rewardsPoints: 0
    };

    logger.info(`New card application created: ${newCard.id} for user: ${userId}`);

    return {
        success: true,
        card: newCard
    };
};

// Get user's cards
const getUserCards = async (userId, cardId, cardType, last4Digits, cardStatus) => {
    var  userCards = cards.filter(card => card.userId == userId);
    if (cardId) {
        userCards = userCards.filter(card => card.id == cardId);
    }
    if (cardType) {
        userCards = userCards.filter(card => card.cardType == cardType);
    }   
    if (last4Digits) {
        userCards = userCards.filter(card => card.cardNumber.endsWith(last4Digits));
    }
    if (cardStatus) {
        userCards = userCards.filter(card => card.status == cardStatus);
    }
    
    return {
        success: true,
        cards: userCards
    };
};

// Get card details
const getCardDetails = async (userId, cardId) => {
    const card = validateCardOwnership(userId, cardId);
    return {
        success: true,
        card
    };
};

// Activate card
const activateCard = async (userId, cardId, activationCode) => {
    const card = validateCardOwnership(userId, cardId);

    if (card.activationStatus === 'activated') {
        throw new AppError('Card is already activated', 400);
    }

    if (!activationCode) {
        throw new AppError('Activation code is required', 400);
    }

    // In a real application, validate activation code
    const activatedCard = {
        ...card,
        status: 'active',
        activationStatus: 'activated',
        activatedDate: new Date().toISOString()
    };

    logger.info(`Card activated: ${cardId}`);

    return {
        success: true,
        card: activatedCard
    };
};

// Block card
const blockCard = async (userId, cardId, reason) => {
    const card = validateCardOwnership(userId, cardId);

    if (card.status === 'blocked') {
        throw new AppError('Card is already blocked', 400);
    }

    if (!reason) {
        throw new AppError('Blocking reason is required', 400);
    }

    const blockedCard = {
        ...card,
        status: 'blocked',
        blockReason: reason,
        blockedDate: new Date().toISOString()
    };

    logger.info(`Card blocked: ${cardId}, reason: ${reason}`);

    return {
        success: true,
        card: blockedCard
    };
};

// Unblock card
const unblockCard = async (userId, cardId) => {
    const card = validateCardOwnership(userId, cardId);

    if (card.status !== 'blocked') {
        throw new AppError('Card is not blocked', 400);
    }

    const unblockedCard = {
        ...card,
        status: 'active',
        blockReason: null,
        blockedDate: null
    };

    logger.info(`Card unblocked: ${cardId}`);

    return {
        success: true,
        card: unblockedCard
    };
};

// Set card PIN
const setCardPin = async (userId, cardId, pin) => {
    const card = validateCardOwnership(userId, cardId);

    if (card.pinSet) {
        throw new AppError('PIN is already set', 400);
    }

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
        throw new AppError('Invalid PIN format', 400);
    }

    const updatedCard = {
        ...card,
        pinSet: true
    };

    logger.info(`PIN set for card: ${cardId}`);

    return {
        success: true,
        card: updatedCard
    };
};

// Change card PIN
const changeCardPin = async (userId, cardId, oldPin, newPin) => {
    const card = validateCardOwnership(userId, cardId);

    if (!card.pinSet) {
        throw new AppError('PIN is not set yet', 400);
    }

    if (!oldPin || !newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        throw new AppError('Invalid PIN format', 400);
    }

    // In a real application, validate old PIN

    logger.info(`PIN changed for card: ${cardId}`);

    return {
        success: true,
        message: 'PIN changed successfully'
    };
};

// Get card transactions
const getCardTransactions = async (userId, cardId, queryParams) => {
    validateCardOwnership(userId, cardId);

    const transactions = cardTransactions.filter(txn => txn.cardId === cardId);

    return {
        success: true,
        transactions,
        pagination: {
            page: queryParams.page || 1,
            limit: queryParams.limit || 20,
            totalRecords: transactions.length,
            totalPages: Math.ceil(transactions.length / (queryParams.limit || 20))
        }
    };
};

// Get card statement
const getCardStatement = async (userId, cardId, queryParams) => {
    const card = validateCardOwnership(userId, cardId);

    if (card.cardType !== 'credit') {
        throw new AppError('Statements are only available for credit cards', 400);
    }

    // In a real application, generate statement based on billing cycle
    return {
        success: true,
        statement: {
            cardId,
            statementDate: new Date().toISOString(),
            dueDate: card.dueDate,
            openingBalance: card.lastStatementBalance,
            closingBalance: card.outstandingAmount,
            minimumDue: card.minimumDue,
            transactions: []
        }
    };
};

// Get card rewards
const getCardRewards = async (userId, cardId) => {
    const card = validateCardOwnership(userId, cardId);
    const product = cardProducts.find(p => p.id === card.productId);

    return {
        success: true,
        rewards: {
            points: card.rewardsPoints,
            value: card.rewardsPoints * product.rewards.pointValue,
            details: product.rewards
        }
    };
};

// Redeem rewards
const redeemRewards = async (userId, cardId, redemptionData) => {
    const card = validateCardOwnership(userId, cardId);

    if (!redemptionData.points || redemptionData.points > card.rewardsPoints) {
        throw new AppError('Invalid redemption points', 400);
    }

    const updatedCard = {
        ...card,
        rewardsPoints: card.rewardsPoints - redemptionData.points
    };

    logger.info(`Rewards redeemed for card: ${cardId}, points: ${redemptionData.points}`);

    return {
        success: true,
        redemption: {
            points: redemptionData.points,
            value: redemptionData.points * 0.25, // Example conversion rate
            status: 'completed'
        }
    };
};

// Update card limits
const updateCardLimits = async (userId, cardId, limitData) => {
    const card = validateCardOwnership(userId, cardId);
    const product = cardProducts.find(p => p.id === card.productId);

    if (card.cardType === 'credit') {
        if (limitData.creditLimit < product.creditLimit.min || 
            limitData.creditLimit > product.creditLimit.max) {
            throw new AppError('Invalid credit limit', 400);
        }
    } else {
        if (limitData.withdrawal > product.transactionLimits.daily.withdrawal ||
            limitData.purchase > product.transactionLimits.daily.purchase) {
            throw new AppError('Invalid transaction limits', 400);
        }
    }

    const updatedCard = {
        ...card,
        ...(card.cardType === 'credit' ? {
            creditLimit: limitData.creditLimit,
            availableLimit: limitData.creditLimit - card.outstandingAmount
        } : {
            dailyLimits: {
                withdrawal: limitData.withdrawal,
                purchase: limitData.purchase
            }
        })
    };

    logger.info(`Limits updated for card: ${cardId}`);

    return {
        success: true,
        card: updatedCard
    };
};

module.exports = {
    getCardProducts,
    getCardProductDetails,
    applyForCard,
    getUserCards,
    getCardDetails,
    activateCard,
    blockCard,
    unblockCard,
    setCardPin,
    changeCardPin,
    getCardTransactions,
    getCardStatement,
    getCardRewards,
    redeemRewards,
    updateCardLimits
}; 