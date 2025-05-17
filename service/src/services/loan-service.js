const { AppError } = require('../middleware/error-handler');
const { logger } = require('../utils/logger');
const { loanProducts, loans, loanPayments, emiSchedules } = require('../data/loans.json');

// Helper function to validate loan ownership
const validateLoanOwnership = (userId, loanId) => {
    const loan = loans.find(l => l.id == loanId);
    if (!loan) {
        throw new AppError('Loan not found', 404);
    }
    // if (loan.userId !== userId) {
    //     throw new AppError('Unauthorized access to loan', 403);
    // }
    return loan;
};

// Get all available loan products
const getLoanProducts = async () => {
    const activeProducts = loanProducts.filter(product => product.status === 'active');
    return {
        success: true,
        products: activeProducts
    };
};

// Get loan product details
const getLoanProductDetails = async (productId) => {
    const product = loanProducts.find(p => p.id === productId);
    if (!product) {
        throw new AppError('Loan product not found', 404);
    }
    return {
        success: true,
        product
    };
};

// Apply for a loan
const applyForLoan = async (userId, applicationData) => {
    const product = loanProducts.find(p => p.id === applicationData.productId);
    if (!product) {
        throw new AppError('Loan product not found', 404);
    }

    // Validate application data
    if (!applicationData.amount || applicationData.amount <= 0) {
        throw new AppError('Invalid loan amount', 400);
    }

    if (applicationData.amount < product.limits.min || applicationData.amount > product.limits.max) {
        throw new AppError('Loan amount outside product limits', 400);
    }

    if (!applicationData.tenure || applicationData.tenure < product.tenureRange.min || applicationData.tenure > product.tenureRange.max) {
        throw new AppError('Invalid loan tenure', 400);
    }

    // Create new loan application
    const newLoan = {
        id: `LOAN${String(loans.length + 1).padStart(3, '0')}`,
        userId,
        productId: applicationData.productId,
        amount: applicationData.amount,
        tenure: applicationData.tenure,
        interestRate: product.interestRate,
        status: 'pending',
        applicationDate: new Date().toISOString(),
        purpose: applicationData.purpose,
        disbursementAccount: applicationData.disbursementAccount,
        emi: calculateEMI(applicationData.amount, product.interestRate, applicationData.tenure)
    };

    logger.info(`New loan application created: ${newLoan.id} for user: ${userId}`);

    return {
        success: true,
        loan: newLoan
    };
};

// Get user's loans
const getUserLoans = async (userId, loanType) => {
    var userLoans = loans.filter(loan => loan.userId == userId);
    if (loanType) {
        userLoans = userLoans.filter(loan => loan.loanType == loanType);
    }
    return {
        success: true,
        loans: userLoans
    };
};

// Get loan details
const getLoanDetails = async ( loanId) => {
    const loan = validateLoanOwnership("XXX", loanId);
    return {
        success: true,
        loan
    };
};

// Get loan schedule
const getLoanSchedule = async (userId, loanId) => {
    const loan = validateLoanOwnership(userId, loanId);
    
    // Generate loan schedule
    const schedule = generateLoanSchedule(loan);
    
    return {
        success: true,
        schedule
    };
};

// Make loan payment
const makeLoanPayment = async (userId, loanId, paymentData) => {
    const loan = validateLoanOwnership(userId, loanId);

    if (loan.status !== 'active') {
        throw new AppError('Loan is not active', 400);
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
        throw new AppError('Invalid payment amount', 400);
    }

    const payment = {
        id: `PAY${String(loanPayments.length + 1).padStart(3, '0')}`,
        loanId,
        userId,
        amount: paymentData.amount,
        paymentDate: new Date().toISOString(),
        paymentMode: paymentData.paymentMode,
        status: 'completed',
        transactionId: paymentData.transactionId
    };

    logger.info(`Loan payment processed: ${payment.id} for loan: ${loanId}`);

    return {
        success: true,
        payment
    };
};

// Get loan statements
const getLoanStatements = async (userId, loanId, queryParams) => {
    const loan = validateLoanOwnership(userId, loanId);
    
    const payments = loanPayments.filter(payment => payment.loanId === loanId);

    return {
        success: true,
        statements: {
            loan,
            payments,
            pagination: {
                page: queryParams.page || 1,
                limit: queryParams.limit || 20,
                totalRecords: payments.length,
                totalPages: Math.ceil(payments.length / (queryParams.limit || 20))
            }
        }
    };
};

// Request loan closure
const requestLoanClosure = async (userId, loanId) => {
    const loan = validateLoanOwnership(userId, loanId);

    if (loan.status !== 'active') {
        throw new AppError('Loan is not active', 400);
    }

    // Calculate foreclosure amount
    const foreclosureAmount = calculateForeclosureAmount(loan);

    return {
        success: true,
        foreclosure: {
            loanId,
            outstandingPrincipal: foreclosureAmount.principal,
            interestDue: foreclosureAmount.interest,
            foreclosureCharges: foreclosureAmount.charges,
            totalAmount: foreclosureAmount.total,
            validTill: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
    };
};

// Helper function to calculate EMI
const calculateEMI = (principal, interestRate, tenure) => {
    const monthlyRate = interestRate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi * 100) / 100;
};

// Helper function to generate loan schedule
const generateLoanSchedule = (loan) => {
    const schedule = [];
    let remainingPrincipal = loan.amount;
    const monthlyRate = loan.interestRate / (12 * 100);

    for (let month = 1; month <= loan.tenure; month++) {
        const interestAmount = remainingPrincipal * monthlyRate;
        const principalAmount = loan.emi - interestAmount;
        remainingPrincipal -= principalAmount;

        schedule.push({
            installmentNo: month,
            dueDate: new Date(new Date(loan.disbursementDate).setMonth(new Date(loan.disbursementDate).getMonth() + month)).toISOString(),
            emi: loan.emi,
            principal: Math.round(principalAmount * 100) / 100,
            interest: Math.round(interestAmount * 100) / 100,
            remainingPrincipal: Math.max(0, Math.round(remainingPrincipal * 100) / 100)
        });
    }

    return schedule;
};

// Helper function to calculate foreclosure amount
const calculateForeclosureAmount = (loan) => {
    // This is a simplified calculation. In real applications, this would be more complex
    const outstandingPrincipal = loan.amount - loan.totalPrincipalPaid;
    const interestDue = outstandingPrincipal * (loan.interestRate / 100) / 12;
    const foreclosureCharges = outstandingPrincipal * 0.02; // 2% foreclosure charges

    return {
        principal: outstandingPrincipal,
        interest: interestDue,
        charges: foreclosureCharges,
        total: outstandingPrincipal + interestDue + foreclosureCharges
    };
};

module.exports = {
    getLoanProducts,
    getLoanProductDetails,
    applyForLoan,
    getUserLoans,
    getLoanDetails,
    getLoanSchedule,
    makeLoanPayment,
    getLoanStatements,
    requestLoanClosure
}; 