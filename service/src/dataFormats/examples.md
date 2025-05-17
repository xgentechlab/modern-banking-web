# API Request Examples

## Authentication

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "password": "user123"
  }'
```

## Account Management

### Create Account
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountType": "SAV",
    "initialDeposit": 5000,
    "currency": "USD",
    "branch": "MAIN001",
    "nominees": [
      {
        "name": "John Doe",
        "relationship": "Spouse"
      }
    ]
  }'
```

### Get Account Statement
```bash
curl -X GET "http://localhost:3000/api/accounts/ACC001/statement?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer <your-token>"
```

## Fund Transfers

### Immediate Transfer
```bash
curl -X POST http://localhost:3000/api/transfers/immediate \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "ACC001",
    "toAccountId": "ACC002",
    "amount": 1000.00,
    "currency": "USD",
    "description": "Rent payment",
    "reference": "RENT-JAN2024"
  }'
```

### Schedule Future Transfer
```bash
curl -X POST http://localhost:3000/api/transfers/schedule \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "ACC001",
    "toAccountId": "ACC002",
    "amount": 500.00,
    "currency": "USD",
    "scheduledDate": "2024-02-01T10:00:00Z",
    "description": "Monthly transfer",
    "reference": "MONTHLY-FEB2024"
  }'
```

## Card Management

### Apply for New Card
```bash
curl -X POST http://localhost:3000/api/cards/apply \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "CC001",
    "accountId": "ACC001",
    "nameOnCard": "JOHN DOE",
    "billingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    }
  }'
```

### Set Card PIN
```bash
curl -X POST http://localhost:3000/api/cards/CARD001/set-pin \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "1234"
  }'
```

## Bill Payments

### Register Biller
```bash
curl -X POST http://localhost:3000/api/bills/billers/register \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "billerId": "BIL001",
    "nickname": "Home Electricity",
    "fields": {
      "consumer_number": "1234567890"
    }
  }'
```

### Pay Bill
```bash
curl -X POST http://localhost:3000/api/bills/pay \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "registeredBillerId": "RB001",
    "amount": 150.00,
    "paymentMode": "cards",
    "paymentDetails": {
      "cardId": "CARD001"
    },
    "billNumber": "BILL123",
    "billDate": "2024-01-15T00:00:00Z",
    "dueDate": "2024-01-31T00:00:00Z"
  }'
```

## Loan Management

### Apply for Loan
```bash
curl -X POST http://localhost:3000/api/loans/apply \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "LP001",
    "amount": 50000,
    "tenure": 36,
    "purpose": "Home Renovation",
    "disbursementAccount": "ACC001"
  }'
```

### Make Loan Payment
```bash
curl -X POST http://localhost:3000/api/loans/LOAN001/payment \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "paymentMode": "netbanking",
    "transactionId": "TXN001"
  }'
```

## Beneficiary Management

### Add Beneficiary
```bash
curl -X POST http://localhost:3000/api/beneficiaries \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "accountNumber": "9876543210",
    "ifscCode": "ABCD0123456",
    "bankName": "Chase Bank",
    "nickname": "John Chase",
    "email": "john.smith@example.com",
    "phone": "+1234567890"
  }'
```

## Response Examples

### Successful Response
```json
{
    "success": true,
    "data": {
        "id": "ACC001",
        "accountType": "SAV",
        "accountNumber": "1234567890",
        "balance": 5000.00,
        "currency": "USD",
        "status": "active"
    }
}
```

### Error Response
```json
{
    "success": false,
    "error": {
        "code": "INSUFFICIENT_BALANCE",
        "message": "Insufficient balance in account"
    }
}
```

## Notes

1. Replace `<your-token>` with the actual JWT token received after login
2. The base URL (`http://localhost:3000`) should be replaced with your actual API endpoint
3. All amounts are in the smallest currency unit (e.g., cents for USD)
4. Dates should be in ISO 8601 format
5. Some endpoints may require additional headers or parameters based on your specific implementation

## Testing Tips

1. Always test the login endpoint first to get a valid token
2. Use the token in subsequent requests by adding it to the Authorization header
3. Start with small amounts for financial transactions during testing
4. Keep track of created resources (accounts, cards, loans) for further operations
5. Test both successful and error scenarios 