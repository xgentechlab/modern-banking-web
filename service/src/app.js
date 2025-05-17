const express = require('express');
const cors = require('cors');
const { logger } = require('./utils/logger');
const { requestLogger } = require('./middleware/request-logger');
const authRoutes = require('./routes/auth-routes');
const accountRoutes = require('./routes/account-routes');
const transferRoutes = require('./routes/transfer-routes');
const beneficiaryRoutes = require('./routes/beneficiary-routes');
const loanRoutes = require('./routes/loan-routes');
const cardRoutes = require('./routes/card-routes');
const billPaymentRoutes = require('./routes/bill-payment-routes');
const commonRoutes = require('./routes/common-routes');
const customer360Routes = require('./routes/customer-360-routes');
const { errorHandler } = require('./middleware/error-handler');
const analyticsRoutes = require('./routes/analytics-routes');
const analyticsApiRoutes = require('./routes/analytics-api-routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/bills', billPaymentRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/customer360', customer360Routes);
// app.use('/analytics', analyticsRoutes);
app.use('/api/analytics', analyticsApiRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
}); 