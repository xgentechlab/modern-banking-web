const fs = require('fs').promises;
const path = require('path');
const { NotFoundError } = require('../utils/errors');
const { logger } = require('../utils/logger');

class AnalyticsApiService {
    constructor() {
        this.transactionsPath = path.join(__dirname, '../data/transactions.json');
        this.accountsPath = path.join(__dirname, '../data/user-accounts.json');
        this.cardsPath = path.join(__dirname, '../data/cards.json');
    }

    async getAnalyticsData(userId, analyticsType, visualizationType, moduleCode, submoduleCode, filters, entities) {
        try {
            logger.info(`Getting ${analyticsType} analytics data for user ${userId} with visualization ${visualizationType}`);
            
            // Route to appropriate analytics handler based on analyticsType
            switch (analyticsType) {
                case 'spending_trends':
                    return await this.getSpendingAnalytics(userId, visualizationType, filters, entities);
                case 'income_analysis':
                    return await this.getIncomeAnalytics(userId, visualizationType, filters, entities);
                case 'transaction_analysis':
                    return await this.getTransactionAnalytics(userId, visualizationType, filters, entities);
                case 'comparison_analysis':
                    return await this.getComparisonAnalytics(userId, visualizationType, filters, entities);
                case 'distribution_analysis':
                    return await this.getDistributionAnalytics(userId, visualizationType, filters, entities);
                default:
                    throw new Error(`Unsupported analytics type: ${analyticsType}`);
            }
        } catch (error) {
            logger.error(`Error in getAnalyticsData: ${error.message}`);
            throw error;
        }
    }

    async getSpendingAnalytics(userId, visualizationType, filters, entities) {
        try {
            // Process filters and entities
            const { startDate, endDate } = this.processDateFilters(filters, entities);
            
            // Get transaction data
            const transactions = await this.getUserTransactions(userId, {
                startDate,
                endDate,
                transactionType: 'debit',
                category: filters.category,
                merchant: filters.merchant
            });

            // Format data for visualization
            const formattedData = await this.formatDataForVisualization(
                transactions,
                'spending_trends',
                visualizationType,
                startDate,
                endDate
            );

            // Prepare response
            return {
                title: "Spending Trends",
                description: "Analysis of your spending patterns over time",
                data: formattedData,
                summary: this.calculateSummary(transactions),
                metadata: {
                    generatedAt: new Date().toISOString(),
                    appliedFilters: {
                        startDate,
                        endDate,
                        category: filters.category || null,
                        merchant: filters.merchant || null
                    }
                }
            };
        } catch (error) {
            logger.error(`Error in getSpendingAnalytics: ${error.message}`);
            throw error;
        }
    }

    async getIncomeAnalytics(userId, visualizationType, filters, entities) {
        try {
            // Process filters and entities
            const { startDate, endDate } = this.processDateFilters(filters, entities);
            
            // Get transaction data
            const transactions = await this.getUserTransactions(userId, {
                startDate,
                endDate,
                transactionType: 'credit',
                source: filters.source
            });

            // Format data for visualization
            const formattedData = await this.formatDataForVisualization(
                transactions,
                'income_analysis',
                visualizationType,
                startDate,
                endDate
            );

            // Prepare response
            return {
                title: "Income Analysis",
                description: "Overview of your income sources and trends",
                data: formattedData,
                summary: this.calculateSummary(transactions),
                metadata: {
                    generatedAt: new Date().toISOString(),
                    appliedFilters: {
                        startDate,
                        endDate,
                        source: filters.source || null
                    }
                }
            };
        } catch (error) {
            logger.error(`Error in getIncomeAnalytics: ${error.message}`);
            throw error;
        }
    }

    async getTransactionAnalytics(userId, visualizationType, filters, entities) {
        try {
            // Process filters and entities
            const { startDate, endDate } = this.processDateFilters(filters, entities);
            
            // Get transaction data
            const transactions = await this.getUserTransactions(userId, {
                startDate,
                endDate,
                transactionType: filters.transactionType,
                minAmount: filters.minAmount,
                maxAmount: filters.maxAmount
            });

            // Format data for visualization
            const formattedData = await this.formatDataForVisualization(
                transactions,
                'transaction_analysis',
                visualizationType,
                startDate,
                endDate
            );

            // Prepare response
            return {
                title: "Transaction Analysis",
                description: "Detailed analysis of your transaction history",
                data: formattedData,
                summary: this.calculateSummary(transactions),
                metadata: {
                    generatedAt: new Date().toISOString(),
                    appliedFilters: {
                        startDate,
                        endDate,
                        transactionType: filters.transactionType || null,
                        minAmount: filters.minAmount || null,
                        maxAmount: filters.maxAmount || null
                    }
                }
            };
        } catch (error) {
            logger.error(`Error in getTransactionAnalytics: ${error.message}`);
            throw error;
        }
    }

    async getComparisonAnalytics(userId, visualizationType, filters, entities) {
        try {
            // Extract comparison specific parameters
            const comparisonType = filters.comparisonType || 'year_over_year'; // Default to year-over-year
            const comparisonPeriods = filters.comparisonPeriods || [];
            const category = filters.category;
            const transactionType = filters.transactionType || 'debit'; // Default to spending comparison

            let title, description;
            let comparisonData = [];
            let dataSets = [];
            
            // Based on comparison type, prepare the appropriate data
            switch (comparisonType) {
                case 'year_over_year':
                    // Get current year and previous year if not specified
                    const currentYear = new Date().getFullYear();
                    const years = comparisonPeriods.length > 0 ? comparisonPeriods : [currentYear, currentYear - 1];
                    
                    title = "Year-over-Year Comparison";
                    description = `Comparing ${transactionType === 'debit' ? 'spending' : 'income'} between ${years.join(' and ')}`;
                    
                    // Get data for each year
                    for (const year of years) {
                        const yearStart = `${year}-01-01`;
                        const yearEnd = `${year}-12-31`;
                        
                        const transactions = await this.getUserTransactions(userId, {
                            startDate: yearStart,
                            endDate: yearEnd,
                            transactionType,
                            category
                        });
                        
                        const monthlyData = this.aggregateTransactionsByMonth(transactions);
                        dataSets.push({
                            name: year.toString(),
                            data: monthlyData
                        });
                        
                        // Calculate total for summary
                        const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
                        comparisonData.push({ name: year.toString(), total });
                    }
                    break;
                    
                case 'income_vs_expense':
                    title = "Income vs Expenses";
                    description = "Comparing your income and expenses over time";
                    
                    // Process date filters
                    const { startDate, endDate } = this.processDateFilters(filters, entities);
                    
                    // Get income transactions
                    const incomeTransactions = await this.getUserTransactions(userId, {
                        startDate,
                        endDate,
                        transactionType: 'credit'
                    });
                    
                    // Get expense transactions
                    const expenseTransactions = await this.getUserTransactions(userId, {
                        startDate,
                        endDate,
                        transactionType: 'DEBIT'
                    });
                    
                    // Determine appropriate time aggregation based on date range
                    const daysDifference = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
                    let aggregationType = 'month'; // Default for income vs expense
                    
                    if (daysDifference <= 31) {
                        aggregationType = 'day';
                    } else if (daysDifference <= 90) {
                        aggregationType = 'week';
                    } else if (daysDifference <= 730) {
                        aggregationType = 'month';
                    } else {
                        aggregationType = 'quarter';
                    }
                    
                    // Aggregate transactions by period
                    const incomeData = this.aggregateTransactionsByPeriod(incomeTransactions, startDate, endDate, aggregationType);
                    const expenseData = this.aggregateTransactionsByPeriod(expenseTransactions, startDate, endDate, aggregationType);
                    
                    dataSets.push({
                        name: 'Income',
                        data: incomeData
                    });
                    
                    dataSets.push({
                        name: 'Expenses',
                        data: expenseData
                    });
                    
                    // Calculate totals for summary
                    const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
                    const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
                    
                    comparisonData.push({ name: 'Income', total: totalIncome });
                    comparisonData.push({ name: 'Expenses', total: totalExpenses });
                    break;
                    
                case 'category_comparison':
                    title = "Category Comparison";
                    description = "Comparing spending across different categories";
                    
                    // Process date filters
                    const dateRange = this.processDateFilters(filters, entities);
                    
                    // Get all transactions
                    const allTransactions = await this.getUserTransactions(userId, {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate,
                        transactionType
                    });
                    
                    // Group transactions by category
                    const categoriesMap = new Map();
                    
                    allTransactions.forEach(tx => {
                        const category = tx.category || 'Uncategorized';
                        if (!categoriesMap.has(category)) {
                            categoriesMap.set(category, 0);
                        }
                        categoriesMap.set(category, categoriesMap.get(category) + tx.amount);
                    });
                    
                    // Convert to the format needed for visualization
                    const categoryData = Array.from(categoriesMap).map(([category, amount]) => ({
                        x: category,
                        y: amount
                    }));
                    
                    // Sort by amount descending
                    categoryData.sort((a, b) => b.y - a.y);
                    
                    dataSets.push({
                        name: 'Categories',
                        data: categoryData
                    });
                    
                    // For summary data
                    comparisonData = categoryData.map(item => ({ name: item.x, total: item.y }));
                    break;
                
                default:
                    throw new Error(`Unsupported comparison type: ${comparisonType}`);
            }
            
            // Format data for the requested visualization type
            const formattedData = this.formatComparisonDataForVisualization(dataSets, visualizationType, comparisonType);
            
            // Calculate summary information
            const summary = {
                comparisons: comparisonData,
                percentageChange: this.calculatePercentageChange(comparisonData)
            };
            
            return {
                title,
                description,
                data: formattedData,
                summary,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    comparisonType,
                    appliedFilters: filters
                }
            };
            
        } catch (error) {
            logger.error(`Error in getComparisonAnalytics: ${error.message}`);
            throw error;
        }
    }

    async getDistributionAnalytics(userId, visualizationType, filters, entities) {
        try {
            // Extract distribution specific parameters
            const distributionVariable = filters.distributionVariable || 'category'; // Default to category distribution
            const buckets = filters.buckets || [];
            
            // Process date filters
            const { startDate, endDate } = this.processDateFilters(filters, entities);
            
            // Get transactions (default to 'debit' for spending distribution)
            const transactionType = filters.transactionType || 'DEBIT';
            
            const transactions = await this.getUserTransactions(userId, {
                startDate,
                endDate,
                transactionType
            });
            
            let title, description;
            let distributionData = [];
            
            // Based on the distribution variable, prepare the appropriate data
            switch (distributionVariable) {
                case 'category':
                    title = "Spending Distribution by Category";
                    description = "Analysis of how your spending is distributed across categories";
                    
                    // Group transactions by category
                    const categoryMap = new Map();
                    
                    transactions.forEach(tx => {
                        const category = tx.category || 'Uncategorized';
                        if (!categoryMap.has(category)) {
                            categoryMap.set(category, 0);
                        }
                        categoryMap.set(category, categoryMap.get(category) + tx.amount);
                    });
                    
                    // Convert to array for visualization
                    distributionData = Array.from(categoryMap).map(([name, value]) => ({ name, value }));
                    
                    // Sort by value descending
                    distributionData.sort((a, b) => b.value - a.value);
                    break;
                    
                case 'amount_range':
                    title = "Transaction Size Distribution";
                    description = "Analysis of your transactions by size ranges";
                    
                    // Define amount ranges if not provided
                    const amountRanges = buckets.length > 0 ? buckets : [
                        { name: "Small (<1,000)", max: 1000 },
                        { name: "Medium (1,000-5,000)", min: 1000, max: 5000 },
                        { name: "Large (5,000-20,000)", min: 5000, max: 20000 },
                        { name: "Very Large (>20,000)", min: 20000 }
                    ];
                    
                    // Initialize counts for each range
                    const rangeMap = new Map();
                    amountRanges.forEach(range => {
                        rangeMap.set(range.name, 0);
                    });
                    
                    // Count transactions in each range
                    transactions.forEach(tx => {
                        for (const range of amountRanges) {
                            const meetsMin = range.min === undefined || tx.amount >= range.min;
                            const meetsMax = range.max === undefined || tx.amount < range.max;
                            
                            if (meetsMin && meetsMax) {
                                rangeMap.set(range.name, rangeMap.get(range.name) + tx.amount);
                                break; // Transaction fits in this range, no need to check others
                            }
                        }
                    });
                    
                    // Convert to array for visualization
                    distributionData = Array.from(rangeMap).map(([name, value]) => ({ name, value }));
                    break;
                    
                case 'time_of_day':
                    title = "Transaction Distribution by Time of Day";
                    description = "Analysis of when your transactions occur throughout the day";
                    
                    // Define time periods
                    const timePeriods = [
                        { name: "Morning (6am-12pm)", start: 6, end: 12 },
                        { name: "Afternoon (12pm-5pm)", start: 12, end: 17 },
                        { name: "Evening (5pm-9pm)", start: 17, end: 21 },
                        { name: "Night (9pm-6am)", start: 21, end: 6 }
                    ];
                    
                    // Initialize counts for each period
                    const periodMap = new Map();
                    timePeriods.forEach(period => {
                        periodMap.set(period.name, 0);
                    });
                    
                    // Count transactions in each period
                    transactions.forEach(tx => {
                        const txDate = new Date(tx.transactionDate);
                        const hour = txDate.getHours();
                        
                        for (const period of timePeriods) {
                            if (period.start < period.end) {
                                // Normal period (e.g., 6am-12pm)
                                if (hour >= period.start && hour < period.end) {
                                    periodMap.set(period.name, periodMap.get(period.name) + tx.amount);
                                    break;
                                }
                            } else {
                                // Overnight period (e.g., 9pm-6am)
                                if (hour >= period.start || hour < period.end) {
                                    periodMap.set(period.name, periodMap.get(period.name) + tx.amount);
                                    break;
                                }
                            }
                        }
                    });
                    
                    // Convert to array for visualization
                    distributionData = Array.from(periodMap).map(([name, value]) => ({ name, value }));
                    break;
                    
                case 'day_of_week':
                    title = "Transaction Distribution by Day of Week";
                    description = "Analysis of your transaction patterns across days of the week";
                    
                    // Define days
                    const days = [
                        { name: "Sunday", value: 0 },
                        { name: "Monday", value: 1 },
                        { name: "Tuesday", value: 2 },
                        { name: "Wednesday", value: 3 },
                        { name: "Thursday", value: 4 },
                        { name: "Friday", value: 5 },
                        { name: "Saturday", value: 6 }
                    ];
                    
                    // Initialize counts for each day
                    const dayMap = new Map();
                    days.forEach(day => {
                        dayMap.set(day.name, 0);
                    });
                    
                    // Count transactions for each day
                    transactions.forEach(tx => {
                        const txDate = new Date(tx.transactionDate);
                        const dayOfWeek = txDate.getDay(); // 0 = Sunday, 6 = Saturday
                        const dayName = days.find(d => d.value === dayOfWeek).name;
                        
                        dayMap.set(dayName, dayMap.get(dayName) + tx.amount);
                    });
                    
                    // Convert to array for visualization
                    distributionData = Array.from(dayMap).map(([name, value]) => ({ name, value }));
                    break;
                    
                default:
                    throw new Error(`Unsupported distribution variable: ${distributionVariable}`);
            }
            
            // Format data for the requested visualization type
            const formattedData = this.formatDistributionDataForVisualization(distributionData, visualizationType);
            
            // Calculate summary information
            const totalAmount = distributionData.reduce((sum, item) => sum + item.value, 0);
            const topCategory = distributionData.length > 0 ? distributionData[0].name : null;
            const topCategoryValue = distributionData.length > 0 ? distributionData[0].value : 0;
            const topCategoryPercentage = totalAmount > 0 ? 
                Number(((topCategoryValue / totalAmount) * 100).toFixed(1)) : 0;
            
            return {
                title,
                description,
                data: formattedData,
                summary: {
                    totalAmount,
                    topCategory,
                    topCategoryPercentage
                },
                metadata: {
                    generatedAt: new Date().toISOString(),
                    distributionVariable,
                    appliedFilters: filters
                }
            };
            
        } catch (error) {
            logger.error(`Error in getDistributionAnalytics: ${error.message}`);
            throw error;
        }
    }

    async getAnalyticsTypes() {
        // Return the supported analytics types with their descriptions
        return [
            {
                code: "spending_trends",
                title: "Spending Trends",
                description: "Analysis of spending patterns over time",
                supportedVisualizations: ["line_chart", "bar_chart"]
            },
            {
                code: "income_analysis",
                title: "Income Analysis",
                description: "Overview of income sources and trends",
                supportedVisualizations: ["line_chart", "pie_chart"]
            },
            {
                code: "transaction_analysis",
                title: "Transaction Analysis",
                description: "Detailed breakdown of transaction history",
                supportedVisualizations: ["table", "bar_chart", "line_chart"]
            },
            {
                code: "comparison_analysis",
                title: "Comparison Analysis",
                description: "Compare data across time periods or categories",
                supportedVisualizations: ["bar_chart", "line_chart", "table"],
                comparisonTypes: [
                    {
                        code: "year_over_year",
                        title: "Year-over-Year",
                        description: "Compare data between different years"
                    },
                    {
                        code: "income_vs_expense",
                        title: "Income vs Expenses",
                        description: "Compare income and expense patterns"
                    },
                    {
                        code: "category_comparison",
                        title: "Category Comparison",
                        description: "Compare spending across categories"
                    }
                ]
            },
            {
                code: "distribution_analysis",
                title: "Distribution Analysis",
                description: "Analyze how values are distributed across categories",
                supportedVisualizations: ["pie_chart", "bar_chart", "table"],
                distributionVariables: [
                    {
                        code: "category",
                        title: "Category Distribution",
                        description: "Distribution of spending across categories"
                    },
                    {
                        code: "amount_range",
                        title: "Transaction Size Distribution",
                        description: "Distribution of transactions by size"
                    },
                    {
                        code: "time_of_day",
                        title: "Time of Day Distribution",
                        description: "When transactions occur throughout the day"
                    },
                    {
                        code: "day_of_week",
                        title: "Day of Week Distribution",
                        description: "How transactions are distributed across weekdays"
                    }
                ]
            }
        ];
    }

    async getVisualizationTypes() {
        // Return the supported visualization types with their descriptions
        return [
            {
                code: "line_chart",
                title: "Line Chart",
                description: "Displays data as a series of points connected by lines",
                bestFor: ["time series", "trends", "continuous data"]
            },
            {
                code: "bar_chart",
                title: "Bar Chart",
                description: "Displays data as rectangular bars",
                bestFor: ["comparisons", "discrete categories"]
            },
            {
                code: "pie_chart",
                title: "Pie Chart",
                description: "Circular chart divided into slices, each showing relative proportion",
                bestFor: ["part-to-whole relationships", "composition"]
            },
            {
                code: "table",
                title: "Table",
                description: "Displays data in rows and columns",
                bestFor: ["detailed records", "precise values", "multiple attributes"]
            }
        ];
    }

    async getUserTransactions(userId, filters) {
        try {
            // Read transactions data
            const transactionsData = await fs.readFile(this.transactionsPath, 'utf8');
            const allTransactions = JSON.parse(transactionsData).transactions || [];

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
            let filteredTransactions = allTransactions.filter(txn => {
                // Check if transaction belongs to user's accounts or cards
                const isUserTransaction = 
                    userAccountIds.includes(txn.fromAccountId) || 
                    userAccountIds.includes(txn.toAccountId) ||
                    (txn.cardId && userCardIds.includes(txn.cardId));

                if (!isUserTransaction) return false;

                // Apply date filters
                if (filters.startDate && new Date(txn.transactionDate) < new Date(filters.startDate)) return false;
                if (filters.endDate && new Date(txn.transactionDate) > new Date(filters.endDate)) return false;

                // Apply transaction type filter
                if (filters.transactionType) {
                    if (filters.transactionType === 'debit' && txn.transactionType.toLowerCase() !== 'debit') return false;
                    if (filters.transactionType === 'credit' && txn.transactionType.toLowerCase() !== 'credit') return false;
                }

                // Apply amount filters
                if (filters.minAmount !== undefined && txn.amount < filters.minAmount) return false;
                if (filters.maxAmount !== undefined && txn.amount > filters.maxAmount) return false;

                // Apply category filter
                if (filters.category && txn.category !== filters.category) return false;

                // Apply merchant filter
                if (filters.merchant && txn.merchantName !== filters.merchant) return false;

                // Apply source filter (for income)
                if (filters.source && txn.source !== filters.source) return false;

                return true;
            });

            return filteredTransactions;
        } catch (error) {
            logger.error(`Error getting user transactions: ${error.message}`);
            throw error;
        }
    }

    processDateFilters(filters, entities) {
        // Start with filters provided directly
        let { startDate, endDate } = filters;

        // If no direct dates, process from entities
        if ((!startDate || !endDate) && entities.period) {
            const period = entities.period;
            const today = new Date();
            
            switch(period.toLowerCase()) {
                case 'this month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
                    break;
                case 'last month':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
                    endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
                    break;
                case 'this quarter':
                    const quarter = Math.floor(today.getMonth() / 3);
                    startDate = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
                    endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
                    break;
                case 'last quarter':
                    const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
                    const year = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
                    const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
                    startDate = new Date(year, adjustedQuarter * 3, 1).toISOString().split('T')[0];
                    endDate = new Date(year, (adjustedQuarter + 1) * 3, 0).toISOString().split('T')[0];
                    break;
                case 'this year':
                    startDate = `${today.getFullYear()}-01-01`;
                    endDate = `${today.getFullYear()}-12-31`;
                    break;
                case 'last year':
                    startDate = `${today.getFullYear() - 1}-01-01`;
                    endDate = `${today.getFullYear() - 1}-12-31`;
                    break;
                case 'last 3 months':
                    endDate = today.toISOString().split('T')[0];
                    const threeMonthsAgo = new Date(today);
                    threeMonthsAgo.setMonth(today.getMonth() - 3);
                    startDate = threeMonthsAgo.toISOString().split('T')[0];
                    break;
                case 'last 6 months':
                    endDate = today.toISOString().split('T')[0];
                    const sixMonthsAgo = new Date(today);
                    sixMonthsAgo.setMonth(today.getMonth() - 6);
                    startDate = sixMonthsAgo.toISOString().split('T')[0];
                    break;
            }
        }

        // If entities contain year, use it
        if (entities.year) {
            const year = parseInt(entities.year);
            if (!isNaN(year)) {
                startDate = `${year}-01-01`;
                endDate = `${year}-12-31`;
            }
        }

        // Default to last 30 days if still undefined
        if (!startDate) {
            const defaultStart = new Date();
            defaultStart.setDate(defaultStart.getDate() - 30);
            startDate = defaultStart.toISOString().split('T')[0];
        }
        
        if (!endDate) {
            endDate = new Date().toISOString().split('T')[0];
        }

        return { startDate, endDate };
    }

    async formatDataForVisualization(transactions, analyticsType, visualizationType, startDate, endDate) {
        try {
            if (transactions.length === 0) {
                return { 
                    type: visualizationType,
                    configuration: this.getEmptyChartConfiguration(visualizationType) 
                };
            }

            switch (visualizationType) {
                case 'line_chart':
                    return this.formatForLineChart(transactions, analyticsType, startDate, endDate);
                case 'bar_chart':
                    return this.formatForBarChart(transactions, analyticsType);
                case 'pie_chart':
                    return this.formatForPieChart(transactions, analyticsType);
                case 'table':
                    return this.formatForTable(transactions);
                default:
                    throw new Error(`Unsupported visualization type: ${visualizationType}`);
            }
        } catch (error) {
            logger.error(`Error formatting data for visualization: ${error.message}`);
            throw error;
        }
    }

    formatForLineChart(transactions, analyticsType, startDate, endDate) {
        // Group transactions by date for line chart
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.transactionDate) - new Date(b.transactionDate)
        );

        // Determine the appropriate time aggregation based on date range
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const daysDifference = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
        
        let aggregationType = 'day'; // default
        let formatString = 'YYYY-MM-DD'; // Always use YYYY-MM-DD format for consistency
        let dateIncrement = 1; // days

        if (daysDifference <= 31) {
            // For periods up to a month, use daily aggregation
            aggregationType = 'day';
            dateIncrement = 1;
        } else if (daysDifference <= 90) {
            // For periods up to 3 months, use weekly aggregation
            aggregationType = 'week';
            dateIncrement = 7;
        } else if (daysDifference <= 730) {
            // For periods up to 2 years, use monthly aggregation
            aggregationType = 'month';
            dateIncrement = 0; // Special case handled below
        } else {
            // For periods longer than 2 years, use quarterly aggregation
            aggregationType = 'quarter';
            dateIncrement = 0; // Special case handled below
        }

        // Create a map to store aggregated data
        const aggregatedMap = new Map();
        let currentDate = new Date(startDateObj);

        // Initialize the aggregation map with all periods in the range
        if (aggregationType === 'day') {
            while (currentDate <= endDateObj) {
                const dateKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
                aggregatedMap.set(dateKey, 0);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else if (aggregationType === 'week') {
            while (currentDate <= endDateObj) {
                // Get ISO week (1-52/53)
                const week = this.getISOWeek(currentDate);
                const year = currentDate.getFullYear();
                // Use the first day of the week as the date key in YYYY-MM-DD format
                const firstDayOfWeek = new Date(currentDate);
                firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                const dateKey = firstDayOfWeek.toISOString().split('T')[0];
                
                if (!aggregatedMap.has(dateKey)) {
                    aggregatedMap.set(dateKey, 0);
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else if (aggregationType === 'month') {
            while (currentDate <= endDateObj) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1; // 1-12
                // Use the first day of the month as the date key in YYYY-MM-DD format
                const dateKey = `${year}-${month.toString().padStart(2, '0')}-01`;
                
                if (!aggregatedMap.has(dateKey)) {
                    aggregatedMap.set(dateKey, 0);
                }
                
                // Move to the next month
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        } else if (aggregationType === 'quarter') {
            while (currentDate <= endDateObj) {
                const year = currentDate.getFullYear();
                const quarter = Math.floor(currentDate.getMonth() / 3) + 1; // 1-4
                // Use the first day of the quarter as the date key in YYYY-MM-DD format
                const quarterStartMonth = (quarter - 1) * 3 + 1;
                const dateKey = `${year}-${quarterStartMonth.toString().padStart(2, '0')}-01`;
                
                if (!aggregatedMap.has(dateKey)) {
                    aggregatedMap.set(dateKey, 0);
                }
                
                // Move to the next quarter
                currentDate.setMonth(currentDate.getMonth() + 3);
            }
        }

        // Populate the map with transaction amounts
        sortedTransactions.forEach(tx => {
            const txDate = new Date(tx.transactionDate);
            let aggregationKey = '';
            
            if (aggregationType === 'day') {
                aggregationKey = txDate.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (aggregationType === 'week') {
                // Get ISO week and find the first day of that week
                const week = this.getISOWeek(txDate);
                const year = txDate.getFullYear();
                const firstDayOfWeek = new Date(txDate);
                firstDayOfWeek.setDate(txDate.getDate() - txDate.getDay() + 1);
                aggregationKey = firstDayOfWeek.toISOString().split('T')[0];
            } else if (aggregationType === 'month') {
                const year = txDate.getFullYear();
                const month = txDate.getMonth() + 1; // 1-12
                aggregationKey = `${year}-${month.toString().padStart(2, '0')}-01`;
            } else if (aggregationType === 'quarter') {
                const year = txDate.getFullYear();
                const quarter = Math.floor(txDate.getMonth() / 3) + 1; // 1-4
                const quarterStartMonth = (quarter - 1) * 3 + 1;
                aggregationKey = `${year}-${quarterStartMonth.toString().padStart(2, '0')}-01`;
            }

            if (aggregatedMap.has(aggregationKey)) {
                if (analyticsType === 'spending_trends' || analyticsType === 'income_analysis') {
                    aggregatedMap.set(aggregationKey, (aggregatedMap.get(aggregationKey) || 0) + tx.amount);
                } else {
                    aggregatedMap.set(aggregationKey, (aggregatedMap.get(aggregationKey) || 0) + 1); // Count transactions
                }
            }
        });

        // Convert map to array of points
        const dataPoints = Array.from(aggregatedMap).map(([date, value]) => ({
            x: date,
            y: value
        }));

        // Sort data points chronologically by date
        dataPoints.sort((a, b) => new Date(a.x) - new Date(b.x));

        // Determine y-axis label based on analytics type
        let yAxisLabel = 'Amount';
        if (analyticsType === 'transaction_analysis') {
            yAxisLabel = 'Number of Transactions';
        }

        // Get human-readable aggregation label
        const aggregationLabel = aggregationType === 'day' ? 'Daily' :
                                aggregationType === 'week' ? 'Weekly' :
                                aggregationType === 'month' ? 'Monthly' : 'Quarterly';

        return {
            type: 'line_chart',
            configuration: {
                xAxis: {
                    type: 'time',
                    label: 'Date',
                    aggregation: aggregationType
                },
                yAxis: {
                    type: 'value',
                    label: yAxisLabel
                },
                series: [
                    {
                        name: analyticsType === 'spending_trends' ? `${aggregationLabel} Spending` : 
                              analyticsType === 'income_analysis' ? `${aggregationLabel} Income` : 
                              `${aggregationLabel} Transactions`,
                        data: dataPoints
                    }
                ]
            }
        };
    }

    // Helper function to get ISO week number
    getISOWeek(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        // January 4 is always in week 1.
        const week1 = new Date(d.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    formatForBarChart(transactions, analyticsType) {
        let categories = [];
        let data = [];

        if (analyticsType === 'spending_trends' || analyticsType === 'income_analysis') {
            // Group by category or source
            const categoryMap = new Map();
            
            transactions.forEach(tx => {
                const category = tx.category || 'Uncategorized';
                categoryMap.set(category, (categoryMap.get(category) || 0) + tx.amount);
            });

            // Convert to arrays for the chart
            categories = Array.from(categoryMap.keys());
            data = Array.from(categoryMap.values());
        } else {
            // Group by transaction type
            const typeMap = new Map();
            
            transactions.forEach(tx => {
                const type = tx.transactionType || 'Unknown';
                typeMap.set(type, (typeMap.get(type) || 0) + 1);
            });

            // Convert to arrays for the chart
            categories = Array.from(typeMap.keys());
            data = Array.from(typeMap.values());
        }

        return {
            type: 'bar_chart',
            configuration: {
                xAxis: {
                    type: 'category',
                    label: analyticsType === 'transaction_analysis' ? 'Transaction Type' : 'Category'
                },
                yAxis: {
                    type: 'value',
                    label: analyticsType === 'transaction_analysis' ? 'Number of Transactions' : 'Amount'
                },
                series: [
                    {
                        name: analyticsType === 'spending_trends' ? 'Spending' : 
                              analyticsType === 'income_analysis' ? 'Income' : 'Transactions',
                        data: categories.map((category, index) => ({
                            x: category,
                            y: data[index]
                        }))
                    }
                ]
            }
        };
    }

    formatForPieChart(transactions, analyticsType) {
        // Group by appropriate category
        const categoryMap = new Map();
        
        if (analyticsType === 'income_analysis') {
            // Group by income source
            transactions.forEach(tx => {
                const source = tx.source || 'Other';
                categoryMap.set(source, (categoryMap.get(source) || 0) + tx.amount);
            });
        } else {
            // Group by expense category
            transactions.forEach(tx => {
                const category = tx.category || 'Uncategorized';
                categoryMap.set(category, (categoryMap.get(category) || 0) + tx.amount);
            });
        }

        // Convert to array for the chart
        const data = Array.from(categoryMap).map(([name, value]) => ({
            name,
            value
        }));

        return {
            type: 'pie_chart',
            configuration: {
                series: [
                    {
                        name: analyticsType === 'income_analysis' ? 'Income Sources' : 'Spending Categories',
                        data
                    }
                ]
            }
        };
    }

    formatForTable(transactions) {
        // Transform transactions for table display
        const tableData = transactions.map(tx => ({
            id: tx.id,
            date: new Date(tx.transactionDate).toISOString().split('T')[0],
            description: tx.description,
            amount: tx.amount,
            type: tx.transactionType,
            category: tx.category || 'Uncategorized',
            merchantName: tx.merchantName || '-'
        }));

        return {
            type: 'table',
            configuration: {
                columns: [
                    { field: 'id', header: 'ID' },
                    { field: 'date', header: 'Date' },
                    { field: 'description', header: 'Description' },
                    { field: 'amount', header: 'Amount' },
                    { field: 'type', header: 'Type' },
                    { field: 'category', header: 'Category' },
                    { field: 'merchantName', header: 'Merchant' }
                ],
                data: tableData
            }
        };
    }

    getEmptyChartConfiguration(visualizationType) {
        switch (visualizationType) {
            case 'line_chart':
                return {
                    xAxis: {
                        type: 'time',
                        label: 'Date'
                    },
                    yAxis: {
                        type: 'value',
                        label: 'Amount'
                    },
                    series: [
                        {
                            name: 'No Data',
                            data: []
                        }
                    ]
                };
            case 'bar_chart':
                return {
                    xAxis: {
                        type: 'category',
                        label: 'Category'
                    },
                    yAxis: {
                        type: 'value',
                        label: 'Amount'
                    },
                    series: [
                        {
                            name: 'No Data',
                            data: []
                        }
                    ]
                };
            case 'pie_chart':
                return {
                    series: [
                        {
                            name: 'No Data',
                            data: []
                        }
                    ]
                };
            case 'table':
                return {
                    columns: [
                        { field: 'id', header: 'ID' },
                        { field: 'date', header: 'Date' },
                        { field: 'description', header: 'Description' },
                        { field: 'amount', header: 'Amount' },
                        { field: 'type', header: 'Type' },
                        { field: 'category', header: 'Category' },
                        { field: 'merchantName', header: 'Merchant' }
                    ],
                    data: []
                };
            default:
                return {};
        }
    }

    calculateSummary(transactions) {
        if (transactions.length === 0) {
            return {
                totalAmount: 0,
                averageAmount: 0,
                changePercentage: 0
            };
        }

        // Calculate total amount
        const totalAmount = Number(transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2));
        
        // Calculate average amount
        const averageAmount = Number((totalAmount / transactions.length).toFixed(2));
        
        // Calculate change percentage (comparing first and last half of period)
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.transactionDate) - new Date(b.transactionDate)
        );
        const midPoint = Math.floor(sortedTransactions.length / 2);
        const firstHalfTotal = sortedTransactions.slice(0, midPoint).reduce((sum, tx) => sum + tx.amount, 0);
        const secondHalfTotal = sortedTransactions.slice(midPoint).reduce((sum, tx) => sum + tx.amount, 0);
        
        let changePercentage = 0;
        if (firstHalfTotal > 0) {
            changePercentage = Number((((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100).toFixed(1));
        }

        return {
            totalAmount,
            averageAmount,
            changePercentage
        };
    }

    aggregateTransactionsByMonth(transactions) {
        const monthMap = new Map();
        
        // Initialize all months
        for (let month = 1; month <= 12; month++) {
            const monthKey = month.toString().padStart(2, '0');
            monthMap.set(monthKey, 0);
        }
        
        // Aggregate transaction amounts by month
        transactions.forEach(tx => {
            const txDate = new Date(tx.transactionDate);
            const monthKey = (txDate.getMonth() + 1).toString().padStart(2, '0');
            
            monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + tx.amount);
        });
        
        // Convert to array of data points
        return Array.from(monthMap).map(([month, amount]) => ({
            x: this.getMonthName(parseInt(month)),
            y: amount
        }));
    }
    
    getMonthName(monthNumber) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return months[monthNumber - 1];
    }
    
    aggregateTransactionsByPeriod(transactions, startDate, endDate, aggregationType) {
        // Create a map to store aggregated data
        const aggregatedMap = new Map();
        
        // Initialize periods
        let currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        // Initialize the aggregation map with all periods in the range
        if (aggregationType === 'day') {
            while (currentDate <= endDateObj) {
                const dateKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
                aggregatedMap.set(dateKey, 0);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else if (aggregationType === 'week') {
            while (currentDate <= endDateObj) {
                // Get ISO week and find the first day of that week
                const week = this.getISOWeek(currentDate);
                const year = currentDate.getFullYear();
                const firstDayOfWeek = new Date(currentDate);
                firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                const dateKey = firstDayOfWeek.toISOString().split('T')[0];
                
                if (!aggregatedMap.has(dateKey)) {
                    aggregatedMap.set(dateKey, 0);
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else if (aggregationType === 'month') {
            while (currentDate <= endDateObj) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1; // 1-12
                const dateKey = `${year}-${month.toString().padStart(2, '0')}-01`;
                
                if (!aggregatedMap.has(dateKey)) {
                    aggregatedMap.set(dateKey, 0);
                }
                
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        } else if (aggregationType === 'quarter') {
            while (currentDate <= endDateObj) {
                const year = currentDate.getFullYear();
                const quarter = Math.floor(currentDate.getMonth() / 3) + 1; // 1-4
                const quarterStartMonth = (quarter - 1) * 3 + 1;
                const dateKey = `${year}-${quarterStartMonth.toString().padStart(2, '0')}-01`;
                
                if (!aggregatedMap.has(dateKey)) {
                    aggregatedMap.set(dateKey, 0);
                }
                
                currentDate.setMonth(currentDate.getMonth() + 3);
            }
        }
        
        // Populate the map with transaction amounts
        transactions.forEach(tx => {
            const txDate = new Date(tx.transactionDate);
            let aggregationKey = '';
            
            if (aggregationType === 'day') {
                aggregationKey = txDate.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (aggregationType === 'week') {
                // Get ISO week and find the first day of that week
                const week = this.getISOWeek(txDate);
                const year = txDate.getFullYear();
                const firstDayOfWeek = new Date(txDate);
                firstDayOfWeek.setDate(txDate.getDate() - txDate.getDay() + 1);
                aggregationKey = firstDayOfWeek.toISOString().split('T')[0];
            } else if (aggregationType === 'month') {
                const year = txDate.getFullYear();
                const month = txDate.getMonth() + 1; // 1-12
                aggregationKey = `${year}-${month.toString().padStart(2, '0')}-01`;
            } else if (aggregationType === 'quarter') {
                const year = txDate.getFullYear();
                const quarter = Math.floor(txDate.getMonth() / 3) + 1; // 1-4
                const quarterStartMonth = (quarter - 1) * 3 + 1;
                aggregationKey = `${year}-${quarterStartMonth.toString().padStart(2, '0')}-01`;
            }
            
            if (aggregatedMap.has(aggregationKey)) {
                aggregatedMap.set(aggregationKey, (aggregatedMap.get(aggregationKey) || 0) + tx.amount);
            }
        });
        
        // Convert to array of data points
        return Array.from(aggregatedMap).map(([date, value]) => ({
            x: date,
            y: value
        }));
    }
    
    formatComparisonDataForVisualization(dataSets, visualizationType, comparisonType) {
        if (dataSets.length === 0) {
            return { 
                type: visualizationType,
                configuration: this.getEmptyChartConfiguration(visualizationType) 
            };
        }
        
        switch (visualizationType) {
            case 'line_chart':
                return {
                    type: 'line_chart',
                    configuration: {
                        xAxis: {
                            type: comparisonType === 'category_comparison' ? 'category' : 'time',
                            label: comparisonType === 'category_comparison' ? 'Category' : 'Date'
                        },
                        yAxis: {
                            type: 'value',
                            label: 'Amount'
                        },
                        series: dataSets
                    }
                };
                
            case 'bar_chart':
                return {
                    type: 'bar_chart',
                    configuration: {
                        xAxis: {
                            type: comparisonType === 'category_comparison' ? 'category' : 'time',
                            label: comparisonType === 'category_comparison' ? 'Category' : 'Date'
                        },
                        yAxis: {
                            type: 'value',
                            label: 'Amount'
                        },
                        series: dataSets
                    }
                };
                
            case 'table':
                // For table, flatten the data sets into a structure suitable for table display
                const columns = [{ field: 'period', header: 'Period' }];
                
                // Add a column for each data set
                dataSets.forEach(dataSet => {
                    columns.push({ field: dataSet.name, header: dataSet.name });
                });
                
                // Create rows
                const rows = [];
                
                // Get all unique x values across all datasets
                const allPeriods = new Set();
                dataSets.forEach(dataSet => {
                    dataSet.data.forEach(point => {
                        allPeriods.add(point.x);
                    });
                });
                
                // Sort periods if they're dates
                const sortedPeriods = Array.from(allPeriods).sort((a, b) => {
                    if (comparisonType === 'category_comparison') {
                        return 0; // Don't sort categories
                    }
                    // Sort dates or periods
                    return a.localeCompare(b);
                });
                
                // Create a row for each period
                sortedPeriods.forEach(period => {
                    const row = { period };
                    
                    // Add values for each dataset
                    dataSets.forEach(dataSet => {
                        const point = dataSet.data.find(p => p.x === period);
                        row[dataSet.name] = point ? point.y : 0;
                    });
                    
                    rows.push(row);
                });
                
                return {
                    type: 'table',
                    configuration: {
                        columns,
                        data: rows
                    }
                };
                
            default:
                throw new Error(`Unsupported visualization type for comparison: ${visualizationType}`);
        }
    }
    
    calculatePercentageChange(comparisonData) {
        if (comparisonData.length < 2) {
            return 0;
        }
        
        // For year-over-year or general two-period comparison
        if (comparisonData.length === 2) {
            const newValue = comparisonData[0].total;
            const oldValue = comparisonData[1].total;
            
            if (oldValue === 0) {
                return newValue > 0 ? 100 : 0;
            }
            
            return Number((((newValue - oldValue) / oldValue) * 100).toFixed(1));
        }
        
        // For income vs expense comparison
        if (comparisonData.length === 2 && 
            comparisonData[0].name === 'Income' && 
            comparisonData[1].name === 'Expenses') {
            
            const income = comparisonData[0].total;
            const expenses = comparisonData[1].total;
            
            // Return savings rate
            return Number((((income - expenses) / income) * 100).toFixed(1));
        }
        
        // For category comparison, return 0 as percentage change doesn't make sense
        return 0;
    }

    formatDistributionDataForVisualization(distributionData, visualizationType) {
        if (distributionData.length === 0) {
            return { 
                type: visualizationType,
                configuration: this.getEmptyChartConfiguration(visualizationType) 
            };
        }
        
        switch (visualizationType) {
            case 'pie_chart':
                return {
                    type: 'pie_chart',
                    configuration: {
                        series: [
                            {
                                name: 'Distribution',
                                data: distributionData
                            }
                        ]
                    }
                };
                
            case 'bar_chart':
                return {
                    type: 'bar_chart',
                    configuration: {
                        xAxis: {
                            type: 'category',
                            label: 'Category'
                        },
                        yAxis: {
                            type: 'value',
                            label: 'Amount'
                        },
                        series: [
                            {
                                name: 'Distribution',
                                data: distributionData.map(item => ({
                                    x: item.name,
                                    y: item.value
                                }))
                            }
                        ]
                    }
                };
                
            case 'table':
                return {
                    type: 'table',
                    configuration: {
                        columns: [
                            { field: 'category', header: 'Category' },
                            { field: 'amount', header: 'Amount' },
                            { field: 'percentage', header: 'Percentage' }
                        ],
                        data: this.formatDistributionForTable(distributionData)
                    }
                };
                
            default:
                throw new Error(`Unsupported visualization type for distribution: ${visualizationType}`);
        }
    }
    
    formatDistributionForTable(distributionData) {
        const totalAmount = distributionData.reduce((sum, item) => sum + item.value, 0);
        
        return distributionData.map(item => ({
            category: item.name,
            amount: item.value,
            percentage: totalAmount > 0 ? 
                Number(((item.value / totalAmount) * 100).toFixed(1)) : 0
        }));
    }
}

module.exports = new AnalyticsApiService(); 