const fs = require('fs').promises;
const path = require('path');

const TRANSACTION_TYPES = {
    TRANSFER: 'TRANSFER',
    WITHDRAWAL: 'WITHDRAWAL',
    DEPOSIT: 'DEPOSIT',
    INVESTMENT: 'INVESTMENT',
    CARD_PAYMENT: 'CARD_PAYMENT',
    BILL_PAYMENT: 'BILL_PAYMENT',
    SALARY: 'SALARY',
    EMI: 'EMI',
    SUBSCRIPTION: 'SUBSCRIPTION',
    INSURANCE: 'INSURANCE',
    REFUND: 'REFUND',
    CASHBACK: 'CASHBACK',
    INTEREST: 'INTEREST'
};

const CHANNELS = {
    ONLINE: 'ONLINE',
    ATM: 'ATM',
    BRANCH: 'BRANCH',
    UPI: 'UPI',
    NEFT: 'NEFT',
    RTGS: 'RTGS',
    IMPS: 'IMPS',
    POS: 'POS'
};

// Account categories with their patterns
const ACCOUNT_PATTERNS = {
    MINOR: {
        accounts: ['100000000002', '100000000003', '100000000004'],
        patterns: {
            monthly: [
                { type: 'DEPOSIT', description: 'Monthly Allowance', amount: [500, 1000], channel: 'BRANCH' },
                { type: 'WITHDRAWAL', description: 'ATM Withdrawal', amount: [100, 500], channel: 'ATM', frequency: 2 },
                { type: 'INTEREST', description: 'Savings Interest Credit', amount: [50, 200], channel: 'ONLINE' }
            ],
            occasional: [
                { type: 'DEPOSIT', description: 'Birthday Gift', amount: [1000, 5000], channel: 'BRANCH' },
                { type: 'DEPOSIT', description: 'Festival Gift', amount: [1000, 2000], channel: 'BRANCH' }
            ]
        }
    },
    PROFESSIONAL: {
        accounts: [
            '100000000005', '100000000006', '100000000007', '100000000008',
            '100000000009', '100000000017', '100000000018', '100000000019',
            '100000000020', '100000000021', '100000000022', '100000000023'
        ],
        patterns: {
            monthly: [
                { type: 'SALARY', description: 'Salary Credit', amount: [40000, 100000], channel: 'NEFT', date: 1 },
                { type: 'BILL_PAYMENT', description: 'Electricity Bill', amount: [1000, 3000], channel: 'ONLINE', date: 10 },
                { type: 'BILL_PAYMENT', description: 'Mobile Bill', amount: [500, 1500], channel: 'UPI', date: 15 },
                { type: 'EMI', description: 'Home Loan EMI', amount: [15000, 25000], channel: 'NACH', date: 5 },
                { type: 'SUBSCRIPTION', description: 'OTT Subscription', amount: [199, 999], channel: 'ONLINE', date: 20 },
                { type: 'INTEREST', description: 'Savings Interest Credit', amount: [100, 500], channel: 'ONLINE', date: 1 }
            ],
            weekly: [
                { type: 'CARD_PAYMENT', description: 'Grocery Shopping', amount: [1000, 3000], channel: 'POS' },
                { type: 'CARD_PAYMENT', description: 'Dining Out', amount: [500, 2000], channel: 'POS' },
                { type: 'WITHDRAWAL', description: 'ATM Withdrawal', amount: [2000, 5000], channel: 'ATM' }
            ],
            quarterly: [
                { type: 'INSURANCE', description: 'Health Insurance Premium', amount: [5000, 10000], channel: 'ONLINE' }
            ],
            occasional: [
                { type: 'REFUND', description: 'Shopping Refund', amount: [500, 3000], channel: 'ONLINE' },
                { type: 'CASHBACK', description: 'Card Cashback', amount: [100, 500], channel: 'ONLINE' }
            ]
        }
    },
    HNI: {
        accounts: [
            '100000000010', '100000000011', '100000000012', '100000000013',
            '100000000014', '100000000015', '100000000016'
        ],
        patterns: {
            monthly: [
                { type: 'INVESTMENT', description: 'Mutual Fund SIP', amount: [50000, 200000], channel: 'ONLINE', date: 5 },
                { type: 'TRANSFER', description: 'Wealth Management', amount: [100000, 500000], channel: 'RTGS', date: 10 },
                { type: 'BILL_PAYMENT', description: 'Credit Card Bill', amount: [100000, 300000], channel: 'ONLINE', date: 15 },
                { type: 'INTEREST', description: 'Savings Interest Credit', amount: [5000, 15000], channel: 'ONLINE', date: 1 }
            ],
            weekly: [
                { type: 'CARD_PAYMENT', description: 'Luxury Shopping', amount: [50000, 200000], channel: 'POS' },
                { type: 'CARD_PAYMENT', description: 'Fine Dining', amount: [10000, 50000], channel: 'POS' }
            ],
            quarterly: [
                { type: 'INVESTMENT', description: 'Stock Investment', amount: [500000, 2000000], channel: 'ONLINE' },
                { type: 'INSURANCE', description: 'Premium Insurance', amount: [100000, 500000], channel: 'ONLINE' }
            ],
            occasional: [
                { type: 'REFUND', description: 'Luxury Purchase Refund', amount: [10000, 50000], channel: 'ONLINE' },
                { type: 'CASHBACK', description: 'Premium Card Cashback', amount: [1000, 5000], channel: 'ONLINE' }
            ]
        }
    }
};

// Special dates in 2024
const SPECIAL_DATES = {
    NEW_YEAR: new Date('2024-01-01'),
    REPUBLIC_DAY: new Date('2024-01-26'),
    HOLI: new Date('2024-03-25'),
    DIWALI: new Date('2024-11-01'),
    CHRISTMAS: new Date('2024-12-25')
};

// Seasonal spending periods
const SEASONAL_PERIODS = [
    { name: 'Summer Sale', start: '2024-05-01', end: '2024-05-31', multiplier: 1.5 },
    { name: 'Monsoon Sale', start: '2024-07-01', end: '2024-07-31', multiplier: 1.3 },
    { name: 'Diwali Sale', start: '2024-10-15', end: '2024-11-15', multiplier: 2 },
    { name: 'Year End Sale', start: '2024-12-15', end: '2024-12-31', multiplier: 1.8 }
];

function generateTransactionId(index) {
    return `TXN${String(index).padStart(8, '0')}`;
}

function generateReference(index) {
    return `REF${String(index).padStart(8, '0')}`;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(min, max) {
    return Number((Math.random() * (max - min) + min).toFixed(2));
}

function isDateInPeriod(date, start, end) {
    return date >= new Date(start) && date <= new Date(end);
}

function adjustAmountForSeason(amount, date) {
    for (const period of SEASONAL_PERIODS) {
        if (isDateInPeriod(date, period.start, period.end)) {
            return amount * period.multiplier;
        }
    }
    return amount;
}

function generateRecurringTransactions(pattern, startDate, endDate) {
    const transactions = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        // Monthly patterns
        pattern.monthly?.forEach(template => {
            if (template.date && currentDate.getDate() === template.date) {
                const amount = getRandomAmount(template.amount[0], template.amount[1]);
                transactions.push({
                    type: template.type,
                    description: template.description,
                    amount: adjustAmountForSeason(amount, currentDate),
                    channel: template.channel,
                    date: new Date(currentDate)
                });
            }
        });

        // Weekly patterns
        if (currentDate.getDay() === 6) { // Saturday
            pattern.weekly?.forEach(template => {
                const amount = getRandomAmount(template.amount[0], template.amount[1]);
                transactions.push({
                    type: template.type,
                    description: template.description,
                    amount: adjustAmountForSeason(amount, currentDate),
                    channel: template.channel,
                    date: new Date(currentDate)
                });
            });

            // Add occasional refunds and cashbacks (10% chance)
            if (pattern.occasional && Math.random() < 0.1) {
                const template = getRandomElement(pattern.occasional);
                transactions.push({
                    type: template.type,
                    description: template.description,
                    amount: getRandomAmount(template.amount[0], template.amount[1]),
                    channel: template.channel,
                    date: new Date(currentDate)
                });
            }
        }

        // Quarterly patterns and interest
        if (currentDate.getDate() === 1) {
            if ([0, 3, 6, 9].includes(currentDate.getMonth())) {
                pattern.quarterly?.forEach(template => {
                    const amount = getRandomAmount(template.amount[0], template.amount[1]);
                    transactions.push({
                        type: template.type,
                        description: template.description,
                        amount: adjustAmountForSeason(amount, currentDate),
                        channel: template.channel,
                        date: new Date(currentDate)
                    });
                });
            }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return transactions;
}

function generateSpecialDateTransactions(accountType, date) {
    const transactions = [];
    const pattern = ACCOUNT_PATTERNS[accountType].patterns;

    switch (accountType) {
        case 'MINOR':
            transactions.push({
                type: 'DEPOSIT',
                description: `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} Gift`,
                amount: getRandomAmount(1000, 5000),
                channel: 'BRANCH',
                date: new Date(date)
            });
            break;
        case 'PROFESSIONAL':
            transactions.push({
                type: 'CARD_PAYMENT',
                description: `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} Shopping`,
                amount: getRandomAmount(5000, 20000),
                channel: 'POS',
                date: new Date(date)
            });
            break;
        case 'HNI':
            transactions.push({
                type: 'CARD_PAYMENT',
                description: `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} Luxury Purchase`,
                amount: getRandomAmount(100000, 500000),
                channel: 'POS',
                date: new Date(date)
            });
            break;
    }

    return transactions;
}

// Helper function to determine transaction type
function determineTransactionType(txnType, fromAccountId, toAccountId) {
    // Credits (money coming in)
    if (
        txnType === TRANSACTION_TYPES.SALARY ||
        txnType === TRANSACTION_TYPES.REFUND ||
        txnType === TRANSACTION_TYPES.CASHBACK ||
        txnType === TRANSACTION_TYPES.INTEREST ||
        (txnType === TRANSACTION_TYPES.TRANSFER && toAccountId) ||
        (txnType === TRANSACTION_TYPES.DEPOSIT && !fromAccountId)
    ) {
        return 'CREDIT';
    }
    // Debits (money going out)
    return 'DEBIT';
}

async function generateTransactions() {
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-12-31T23:59:59Z');
    let allTransactions = [];
    let transactionIndex = 0;

    // Generate transactions for each account type
    for (const [accountType, config] of Object.entries(ACCOUNT_PATTERNS)) {
        // Generate recurring transactions
        const recurringTransactions = generateRecurringTransactions(
            config.patterns,
            startDate,
            endDate
        );

        // Generate special date transactions
        const specialDateTransactions = Object.values(SPECIAL_DATES).flatMap(date =>
            generateSpecialDateTransactions(accountType, date)
        );

        // Combine and format transactions
        const accountTransactions = [...recurringTransactions, ...specialDateTransactions]
            .map(transaction => {
                const fromAccountId = transaction.type === 'SALARY' || 
                                    transaction.type === 'REFUND' || 
                                    transaction.type === 'CASHBACK' || 
                                    transaction.type === 'INTEREST' ? null : 
                    getRandomElement(config.accounts);
                const toAccountId = transaction.type === 'TRANSFER' ? 
                    getRandomElement(Object.values(ACCOUNT_PATTERNS)
                        .flatMap(c => c.accounts)
                        .filter(acc => acc !== fromAccountId)) :
                    (transaction.type === 'SALARY' || 
                     transaction.type === 'REFUND' || 
                     transaction.type === 'CASHBACK' || 
                     transaction.type === 'INTEREST' ? fromAccountId : null);

                return {
                    id: generateTransactionId(transactionIndex++),
                    fromAccountId,
                    toAccountId,
                    type: transaction.type,
                    transactionType: determineTransactionType(transaction.type, fromAccountId, toAccountId),
                    amount: transaction.amount,
                    currency: "INR",
                    status: "SUCCESS",
                    description: transaction.description,
                    transactionDate: transaction.date.toISOString(),
                    valueDate: transaction.date.toISOString(),
                    channel: transaction.channel,
                    reference: generateReference(transactionIndex)
                };
            });

        allTransactions = [...allTransactions, ...accountTransactions];
    }

    // Sort transactions by date
    allTransactions.sort((a, b) => 
        new Date(a.transactionDate) - new Date(b.transactionDate)
    );

    // Write to file
    await fs.writeFile(
        path.join(__dirname, '../data/transactions.json'),
        JSON.stringify({ transactions: allTransactions }, null, 4),
        'utf8'
    );
}

generateTransactions().catch(console.error); 