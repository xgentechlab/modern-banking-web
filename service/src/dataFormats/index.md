# API Endpoints Documentation

## Authentication Endpoints
Base path: `/api/auth`

| Method | Endpoint | Description | Request Format |
|--------|----------|-------------|----------------|
| POST | `/login` | Authenticate user and get JWT token | [login-request.json](auth/login-request.json) |
| POST | `/logout` | Invalidate JWT token | [logout-request.json](auth/logout-request.json) |

## Account Endpoints
Base path: `/api/accounts`

| Method | Endpoint | Description | Request Format |
|--------|----------|-------------|----------------|
| POST | `/` | Create a new account | [create-account-request.json](account/create-account-request.json) |
| PUT | `/:accountId` | Update account details | [update-account-request.json](account/update-account-request.json) |
| GET | `/types` | Get available account types | No request body |
| GET | `/user` | Get user's accounts | No request body |
| GET | `/:accountId` | Get account details | No request body |
| GET | `/:accountId/balance` | Get account balance | No request body |
| GET | `/:accountId/mini-statement` | Get mini statement | No request body |
| GET | `/:accountId/statement` | Get full statement | [get-statement-request.json](account/get-statement-request.json) |
| DELETE | `/:accountId` | Delete account | No request body |

## Transfer Endpoints
Base path: `/api/transfers`

| Method | Endpoint | Description | Request Format |
|--------|----------|-------------|----------------|
| POST | `/immediate` | Make immediate transfer | [immediate-transfer-request.json](transfer/immediate-transfer-request.json) |
| POST | `/schedule` | Schedule future transfer | [schedule-transfer-request.json](transfer/schedule-transfer-request.json) |
| POST | `/international` | Make international transfer | [international-transfer-request.json](transfer/international-transfer-request.json) |
| GET | `/:transferId/status` | Get transfer status | No request body |
| DELETE | `/scheduled/:transferId` | Cancel scheduled transfer | No request body |
| GET | `/` | Get user's transfers | No request body |

## Card Endpoints
Base path: `/api/cards`

| Method | Endpoint | Description | Request Format |
|--------|----------|-------------|----------------|
| GET | `/products` | Get available card products | No request body |
| GET | `/products/:productId` | Get card product details | No request body |
| POST | `/apply` | Apply for a new card | [apply-card-request.json](card/apply-card-request.json) |
| GET | `/` | Get user's cards | No request body |
| GET | `/:cardId` | Get card details | No request body |
| POST | `/:cardId/activate` | Activate card | [activate-card-request.json](card/activate-card-request.json) |
| POST | `/:cardId/block` | Block card | [block-card-request.json](card/block-card-request.json) |
| POST | `/:cardId/unblock` | Unblock card | No request body |
| POST | `/:cardId/set-pin` | Set card PIN | [set-pin-request.json](card/set-pin-request.json) |
| POST | `/:cardId/change-pin` | Change card PIN | [change-pin-request.json](card/change-pin-request.json) |
| GET | `/:cardId/transactions` | Get card transactions | [get-transactions-request.json](card/get-transactions-request.json) |
| GET | `/:cardId/statement` | Get card statement | No request body |
| GET | `/:cardId/rewards` | Get card rewards | No request body |
| POST | `/:cardId/rewards/redeem` | Redeem rewards | [redeem-rewards-request.json](card/redeem-rewards-request.json) |
| PUT | `/:cardId/limits` | Update card limits | [update-limits-request.json](card/update-limits-request.json) |

## Loan Endpoints
Base path: `/api/loans`

| Method | Endpoint | Description | Request Format |
|--------|----------|-------------|----------------|
| GET | `/products` | Get available loan products | No request body |
| GET | `/products/:productId` | Get loan product details | No request body |
| POST | `/apply` | Apply for a loan | [apply-loan-request.json](loan/apply-loan-request.json) |
| GET | `/` | Get user's loans | No request body |
| GET | `/:loanId` | Get loan details | No request body |
| GET | `/:loanId/schedule` | Get loan schedule | No request body |
| POST | `/:loanId/payment` | Make loan payment | [make-payment-request.json](loan/make-payment-request.json) |
| GET | `/:loanId/statements` | Get loan statements | [get-statements-request.json](loan/get-statements-request.json) |
| POST | `/:loanId/closure` | Request loan closure | No request body |

## Bill Payment Endpoints
Base path: `/api/bills`

| Method | Endpoint | Description | Request Format |
|--------|----------|-------------|----------------|
| GET | `/billers` | Get available billers | No request body |
| GET | `/billers/:billerId` | Get biller details | No request body |
| POST | `/billers/register` | Register a new biller | [register-biller-request.json](bill/register-biller-request.json) |
| GET | `/registered-billers` | Get registered billers | No request body |
| PUT | `/registered-billers/:registeredBillerId` | Update registered biller | [update-biller-request.json](bill/update-biller-request.json) |
| DELETE | `/registered-billers/:registeredBillerId` | Delete registered biller | No request body |
| POST | `/fetch-bill` | Fetch bill details | [fetch-bill-request.json](bill/fetch-bill-request.json) |
| POST | `/pay` | Pay bill | [pay-bill-request.json](bill/pay-bill-request.json) |
| GET | `/history` | Get payment history | [payment-history-request.json](bill/payment-history-request.json) |
| GET | `/payments/:paymentId` | Get payment details | No request body |
| POST | `/auto-pay` | Setup auto-pay | [setup-autopay-request.json](bill/setup-autopay-request.json) |
| PUT | `/auto-pay/:registeredBillerId` | Update auto-pay | [update-autopay-request.json](bill/update-autopay-request.json) |
| DELETE | `/auto-pay/:registeredBillerId` | Cancel auto-pay | No request body |

## Beneficiary Endpoints
Base path: `/api/beneficiaries`

| Method | Endpoint | Description | Request Format |
|--------|----------|-------------|----------------|
| GET | `/` | Get list of beneficiaries | [get-beneficiaries-request.json](beneficiary/get-beneficiaries-request.json) |
| POST | `/` | Add a new beneficiary | [add-beneficiary-request.json](beneficiary/add-beneficiary-request.json) |
| PUT | `/:beneficiaryId` | Update beneficiary | [update-beneficiary-request.json](beneficiary/update-beneficiary-request.json) |
| DELETE | `/:beneficiaryId` | Delete beneficiary | No request body |
| POST | `/:beneficiaryId/verify` | Verify beneficiary | [validate-beneficiary-request.json](beneficiary/validate-beneficiary-request.json) |
| GET | `/:beneficiaryId` | Get beneficiary details | No request body |

## Authentication
All endpoints except `/api/auth/login` require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Common Response Format
All endpoints follow a common response format:
```json
{
    "success": true/false,
    "data": {}, // Response data if successful
    "error": {  // Error details if unsuccessful
        "code": "ERROR_CODE",
        "message": "Error description"
    }
}
```

## Pagination
Endpoints that return lists support pagination using query parameters:
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 20, max: 100)

## Error Handling
Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 