export const ACTION_TYPES = {
    READ: 'READ',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  };
  
  // Component Resolution Rules
  export const RESOLUTION_RULES = {
    // Accounts Module
    ACC: {
      // Account Balance
      ACC_BALANCE: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AccountsModule',
            config: {
              viewMode: 'grid',
              showBalances: true,
              showTransactions: false,
              showStatement: false,
              title: 'Account Balance'
            }
          },
          complete: {
            component: 'AccountsModule',
            config: {
              viewMode: 'grid',
              showBalances: true,
              showTransactions: false,
              showStatement: false,
              title: 'Account Balance'
            }
          }
        }
      },
      // Account Statement
      ACC_MINI_STMT: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AccountsModule',
            config: {
              viewMode: 'grid',
              showBalances: true,
              showTransactions: true,
              title: 'Mini Statement'
            }
          },
          complete: {
            component: 'AccountsModule',
            config: {
              viewMode: 'single',
              showDetails: false,
              showTransactions: true,
              showStatement: false,
              title: 'Mini Statement'
            }
          }
        }
      },
      ACC_LIST :{
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AccountsModule',
            config: {
              viewMode: 'grid',
              showBalances: false,
              showTransactions: false,
              showStatement: false,
              title: 'Accounts'
            }
          }
        }
      },
      ACC_DETAILS :{
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AccountsModule',
            config: { 
              viewMode: 'grid',
              showBalances: true,
              showTransactions: false,
              showStatement: false,
              title: 'Account Details'
            }
          }
        }
      },
      ACC_FULL_STMT: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AccountsModule',
            config: {
              viewMode: 'single',
              showDetails: false,
              showTransactions: false,
              showStatement: true,
              title: 'Full Statement'
            }
          }
        }
      }
    },
  
    // Transfers Module
    TRF: {
      // Immediate Transfer
      TRF_IMMEDIATE: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'TransfersModule',
            config: {
              viewMode: 'form',
              showQuickTransfer: false
            }
          },
          missingBeneficiary: {
            component: 'BeneficiariesModule',
            config: {
              viewMode: 'grid',
              selectable: true
            }
          },
          complete: {
            component: 'TransfersModule',
            config: {
              viewMode: 'confirmation'
            }
          }
        }
      },
  
      // Schedule Transfer
      TRF_SCHEDULE: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'TransfersModule',
            config: {
              viewMode: 'form',
              showScheduleForm: true
            }
          },
          missingBeneficiary: {
            component: 'BeneficiariesModule',
            config: {
              viewMode: 'grid',
              selectable: true
            }
          },
          complete: {
            component: 'TransfersModule',
            config: {
              viewMode: 'confirmation',
              showScheduleDetails: true
            }
          }
        }
      },
  
      // Transfer Status
      TRF_STATUS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'TransfersModule',
            config: {
              viewMode: 'single',
              showTransferDetails: true
            }
          },
          missingTransferId: {
            component: 'TransfersModule',
            config: {
              viewMode: 'grid',
              showHistory: true,
              selectable: true
            }
          }
        }
      },
  
      // Cancel Scheduled Transfer
      TRF_CANCEL: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'TransfersModule',
            config: {
              viewMode: 'single',
              showCancelForm: true
            }
          },
          missingTransferId: {
            component: 'TransfersModule',
            config: {
              viewMode: 'grid',
              showHistory: true,
              selectable: true,
              filterScheduled: true
            }
          },
          complete: {
            component: 'TransfersModule',
            config: {
              viewMode: 'confirmation',
              showCancelConfirmation: true
            }
          }
        }
      },
  
      // Domestic Transfer
      TRF_DOMESTIC: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'TransfersModule',
            config: {
              viewMode: 'form',
              transferType: 'domestic'
            }
          },
          missingBeneficiary: {
            component: 'BeneficiariesModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              filterDomestic: true
            }
          },
          complete: {
            component: 'TransfersModule',
            config: {
              viewMode: 'confirmation',
              transferType: 'domestic'
            }
          }
        }
      },
  
      // International Transfer
      TRF_INTL: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'TransfersModule',
            config: {
              viewMode: 'form',
              transferType: 'international'
            }
          },
          missingBeneficiary: {
            component: 'BeneficiariesModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              filterInternational: true
            }
          },
          complete: {
            component: 'TransfersModule',
            config: {
              viewMode: 'confirmation',
              transferType: 'international'
            }
          }
        }
      },
  
      // Transfer History
      TRF_HISTORY: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'TransfersModule',
            config: {
              viewMode: 'grid',
              showHistory: true
            }
          }
        }
      }
    },
  
    // Cards Module
    CARD: {
      // Card Products & List
      CARD_PRODUCTS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              showProducts: true,
              showApplicationForm: false
            }
          }
        }
      },
      // Card Application
      CARD_APPLY: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'form',
              showApplicationForm: true
            }
          },
          complete: {
            component: 'CardsModule',
            config: {
              viewMode: 'confirmation',
              showApplicationForm: true
            }
          }
        }
      },
      // List User Cards
      CARD_LIST: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              showDetails: true,
              showTransactions: false
            }
          }
        }
      },
      // Card Details
      CARD_DETAILS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showTransactions: false
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Card Activation
      CARD_ACTIVATE: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showActivation: true
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Block Card
      CARD_BLOCK: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showSecurity: true,
              securityAction: 'block'
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Unblock Card
      CARD_UNBLOCK: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showSecurity: true,
              securityAction: 'unblock'
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Set Card PIN
      CARD_SET_PIN: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showSecurity: true,
              securityAction: 'setPin'
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Change Card PIN
      CARD_CHANGE_PIN: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showSecurity: true,
              securityAction: 'changePin'
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Card Transactions
      CARD_TRANSACTIONS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showTransactions: true
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Card Statement
      CARD_STATEMENT: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showStatement: true
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Card Rewards
      CARD_REWARDS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showRewards: true
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Redeem Rewards
      CARD_REDEEM: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'CardsModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showRewards: true,
              showRedemption: true
            }
          },
          missingCardId: {
            component: 'CardsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          },
          complete: {
            component: 'CardsModule',
            config: {
              viewMode: 'confirmation',
              showRewards: true,
              showRedemption: true
            }
          }
        }
      }
    },
  
    // Bills Module
    BIL: {
      // Pay Bill
      BIL_PAY: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'BillsModule',
            config: {
              viewMode: 'grid',
              showQuickPay: true
            }
          },
          missingBiller: {
            component: 'BillsModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showQuickPay: true
            }
          },
          complete: {
            component: 'BillsModule',
            config: {
              viewMode: 'form',
              showConfirmation: true
            }
          }
        }
      }
    },
  
    // Loans Module
    LOAN: {
      // Loan Products
      LOAN_PRODUCTS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              showProducts: true,
              showApplicationForm: false
            }
          }
        }
      },
      // Loan Product Details
      LOAN_PRODUCT_DETAILS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'single',
              showProductDetails: true
            }
          },
          missingProductId: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              showProducts: true,
              selectable: true
            }
          }
        }
      },
      // Apply for Loan
      LOAN_APPLY: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'form',
              showApplicationForm: true
            }
          },
          missingProductId: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              showProducts: true,
              selectable: true
            }
          },
          complete: {
            component: 'LoansModule',
            config: {
              viewMode: 'confirmation',
              showApplicationForm: true
            }
          }
        }
      },
      // List User Loans
      LOAN_LIST: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              showDetails: true,
              showSchedule: false
            }
          }
        }
      },
      // Loan Details
      LOAN_DETAILS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showSchedule: false
            }
          },
          missingLoanId: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Loan Schedule
      LOAN_SCHEDULE: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showSchedule: true
            }
          },
          missingLoanId: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Make Payment
      LOAN_PAYMENT: {
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showPayment: true
            }
          },
          missingLoanId: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          },
          complete: {
            component: 'LoansModule',
            config: {
              viewMode: 'confirmation',
              showPayment: true
            }
          }
        }
      },
      // Loan Statements
      LOAN_STATEMENTS: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showStatements: true
            }
          },
          missingLoanId: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          }
        }
      },
      // Request Closure
      LOAN_CLOSURE: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'LoansModule',
            config: {
              viewMode: 'single',
              showDetails: true,
              showClosure: true
            }
          },
          missingLoanId: {
            component: 'LoansModule',
            config: {
              viewMode: 'grid',
              selectable: true,
              showDetails: true
            }
          },
          complete: {
            component: 'LoansModule',
            config: {
              viewMode: 'confirmation',
              showClosure: true
            }
          }
        }
      }
    },
  
    // Profile Module
    PROF: {
      EDIT_PROFILE: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'ProfileModule',
            config: {
              viewMode: 'form',
              showAddressForm: true,
              showMobileForm: true,
              showEmailForm: true
            }
          }
        }
      },
      // Edit Address
      EDIT_ADDRESS: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'ProfileModule',
            config: {
              viewMode: 'form',
              showAddressForm: true,
              showMobileForm: false,
              showEmailForm: false
            }
          },
          complete: {
            component: 'ProfileModule',
            config: {
              viewMode: 'confirmation',
              showAddressForm: true
            }
          }
        }
      },
      // Edit Mobile Number
      EDIT_MOBILE_NUMBER: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'ProfileModule',
            config: {
              viewMode: 'form',
              showAddressForm: false,
              showMobileForm: true,
              showEmailForm: false
            }
          },
          complete: {
            component: 'ProfileModule',
            config: {
              viewMode: 'confirmation',
              showMobileForm: true
            }
          }
        }
      },
      // Edit Email
      EDIT_EMAIL: {
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'ProfileModule',
            config: {
              viewMode: 'form',
              showAddressForm: false,
              showMobileForm: false,
              showEmailForm: true
            }
          },
          complete: {
            component: 'ProfileModule',
            config: {
              viewMode: 'confirmation',
              showEmailForm: true
            }
          }
        }
      }
    },
    ANALYTICS: {
      "ANALYTICS_TRANSACTIONS": {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AnalyticsModule',
            config: {
              viewMode: 'grid',
              showTransactions: true,
              analysisType: 'transaction_analysis'
            }
          }
        }
      },
      "ANALYTICS_SPENDING": {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AnalyticsModule',
            config: {
              viewMode: 'grid',
              showSpending: true,
              analysisType: 'spending_trends'
            }
          }
        }
      },
      "ANALYTICS_INCOME": {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AnalyticsModule',
            config: {
              viewMode: 'grid',
              showIncome: true,
              analysisType: 'income_analysis'
            }
          }
        }
      },
      "ANALYTICS_BUDGET": {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AnalyticsModule',
            config: {
              viewMode: 'grid',
              showBudget: true,
              analysisType: 'budget_tracking'
            }
          }
        }
      },
      "ANALYTICS_INVESTMENT": {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AnalyticsModule',
            config: {
              viewMode: 'grid',
              showInvestment: true,
              analysisType: 'investment_performance'
            }
          }
        }
      },
      ANALYTICS_SUMMARY: {
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'AnalyticsModule',
            config: {
              viewMode: 'grid',
              showSummary: true
            }
          }
        }
      }
    },
    "BEN":{
      "BEN_ADD":{
        type: ACTION_TYPES.CREATE,
        resolutionStrategy: {
          default: {
            component: 'BeneficiariesModule',
            config: {
              viewMode: 'form',
              showBeneficiaryForm: true,
              showList: false,
              showDetails: false
            }
          }
        },
      },
      "BEN_LIST":{
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'BeneficiariesModule',
            config: {
              viewMode: 'grid',
              showList: true,
              showDetails: false
            }
          }
        }
      },
      "BEN_DETAILS":{
        type: ACTION_TYPES.READ,
        resolutionStrategy: {
          default: {
            component: 'BeneficiariesModule',
          }
        }
      },
      "BEN_EDIT":{
        type: ACTION_TYPES.UPDATE,
        resolutionStrategy: {
          default: {
            component: 'BeneficiariesModule',
          }
        }
      }
    }
      
  };