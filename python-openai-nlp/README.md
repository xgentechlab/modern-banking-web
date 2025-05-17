# Banking NLP Service

A microservice that processes natural language banking commands and returns structured output for use by other microservices.

## Features

- Natural language processing for banking commands
- Intent recognition for common banking operations
- Entity extraction (amounts, accounts, dates, etc.)
- RESTful API endpoint
- Real-time processing with no data persistence
- Error handling and validation

## Requirements

- Python 3.8+
- OpenAI API key

## Setup

1. Clone the repository
2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
DEBUG=False
```

## Running the Service

Start the service using uvicorn:
```bash
uvicorn app:app --reload
```

The service will be available at `http://localhost:8000`

## API Endpoints

### POST /process-text

Process a natural language banking command.

Request body:
```json
{
    "text": "Transfer $200 to savings account"
}
```

Response:
```json
{
    "intent": "transfer_funds",
    "entities": {
        "amount": "200",
        "target_account": "savings"
    },
    "raw_text": "Transfer $200 to savings account"
}
```

### GET /health

Health check endpoint.

Response:
```json
{
    "status": "healthy"
}
```

## Response Optimization

For improved performance, the following optimizations have been implemented:

### 1. Simplified Response Format for QUERY Flow

The `/process-text` endpoint now returns a simplified response format when processing QUERY flow requests. This reduces response time by including only essential fields in the response.

#### Original Response Format
```json
{
  "module": {
    "moduleCode": "ACC",
    "moduleName": "Accounts"
  },
  "sub_module": {
    "submoduleCode": "ACC_LIST",
    "submoduleName": "List Accounts",
    "endpoint": "/accounts/user/:userId",
    "requestFile": null
  },
  "flow": "QUERY",
  "entities": {},
  "validation": {
    "is_complete": true,
    "missing_parameters": [],
    "questions": null
  },
  "resolution": {
    "is_resolved": true,
    "resolution_parameters": [],
    "questions": null,
    "data": null
  },
  "raw_text": "show my accounts",
  "error": null
}
```

#### New Simplified Response Format (For QUERY Flow)
```json
{
  "moduleCode": "ACC",
  "submoduleCode": "ACC_LIST",
  "flow": "QUERY",
  "entities": {},
  "raw_text": "show my accounts",
  "error": null
}
```

Note that TRANSFER and ANALYTICS flows still use the original response format with full details.

### 2. Single API Call Processing for All Modules

We've optimized the processing of QUERY flow commands by:

1. **Eliminating External API Calls**: For all modules with local mapping data available, the data from respective module mapping files (e.g., `account-mapping.json`, `card-mapping.json`) is used directly instead of making external API calls to fetch request formats.

2. **Combined ChatGPT API Call**: Instead of making separate API calls to determine:
   - Module/submodule identification
   - Flow determination
   - Entity extraction

   All of these are now done in a single API call, significantly reducing response time.

3. **Skipping Request Validator**: For QUERY flow, the system now skips the validator service entirely, using only the entities extracted by the NLP model. This eliminates redundant processing and API calls.

4. **Module-Agnostic Entity Extraction**: The system now implements a fully generic approach to entity extraction across all modules:
   - Each module's properties are dynamically considered during entity extraction
   - The same prompt system works universally for ACC, CARD, TRF, LOAN, BILL, and other modules
   - Entity extraction is driven by the properties defined in each module's mapping file
   - No module-specific hardcoded logic is required

5. **Smart Entity Extraction**: The system intelligently extracts entities based on context:
   - When an entity is identified but its exact value isn't specified, the system uses the most appropriate value from the allowed values in the property definition
   - For boolean properties, values are inferred based on context (e.g., "block my card" → `cardStatus: "inactive"`)
   - For date properties, appropriate date formats are used
   - Domain-specific knowledge is applied (e.g., "credit" in "credit card" maps to `cardType: "CREDIT"`)

Example of module-specific entity extraction:

```json
// For query: "Show my account balance"
{
  "moduleCode": "ACC",
  "submoduleCode": "ACC_BALANCE",
  "flow": "QUERY",
  "entities": {
    "accountType": "SAV"  // Using allowed value "SAV" from accountType property
  }
}

// For query: "Block my debit card"
{
  "moduleCode": "CARD",
  "submoduleCode": "CARD_BLOCK",
  "flow": "QUERY",
  "entities": {
    "cardType": "DEBIT",   // Extracted from context
    "cardStatus": "inactive"  // Inferred from the operation "block"
  }
}

// For query: "Transfer $50 to savings"
{
  "moduleCode": "TRF",
  "submoduleCode": "TRF_INITIATE",
  "flow": "TRANSFER",
  "entities": {
    "amount": "50",
    "targetAccountType": "SAV"  // Using allowed value "SAV" for "savings"
  }
}
```

These optimizations significantly reduce response time across all query types and modules while improving the quality and consistency of entity extraction.

### 3. Simplified Response Format for ANALYTICS Flow

The `/process-text` endpoint now returns a simplified response format for ANALYTICS flow requests, similar to the QUERY flow optimization. This reduces response time while providing all necessary information for the UI to render appropriate visualizations.

#### Original ANALYTICS Response Format
```json
{
  "module": {
    "moduleCode": "ANALYTICS",
    "moduleName": "Analytics"
  },
  "sub_module": {
    "submoduleCode": "ANALYTICS_TRANSACTIONS",
    "submoduleName": "Transactions analytics",
    "endpoint": "/analytics/transactions",
    "requestFile": null
  },
  "flow": "ANALYTICS",
  "entities": {
    "year": 2024
  },
  "validation": {
    "is_complete": true,
    "missing_parameters": [],
    "questions": null
  },
  "resolution": {
    "is_resolved": true,
    "resolution_parameters": null,
    "questions": null,
    "data": {
      "userId": "14785236987459",
      "filtersApplied": {
        "startDate": "2025-04-15",
        "endDate": "2025-05-15",
        "transactionType": null,
        "channel": null,
        "category": null,
        "accountId": null,
        "cardId": null,
        "beneficiaryId": null
      },
      "summary": { /* ... summary data ... */ },
      "analytics": { /* ... analytics data ... */ },
      "visualization": { /* ... visualization config ... */ }
    }
  },
  "raw_text": "show my spending trends for 2024",
  "error": null
}
```

#### New Simplified Response Format (For ANALYTICS Flow)
```json
{
  "moduleCode": "ANALYTICS",
  "submoduleCode": "ANALYTICS_SPENDING",
  "flow": "ANALYTICS",
  "entities": {
    "year": 2024
  },
  "visualizationType": "bar_chart",
  "analyticsType": "spending_trends",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "raw_text": "show my spending trends for 2024",
  "error": null
}
```

The optimized ANALYTICS flow response:

1. **Contains only essential metadata**: moduleCode, submoduleCode, flow type, entities, and raw text
2. **Adds analytics-specific fields**:
   - `visualizationType`: The recommended visualization format (table, bar_chart, pie_chart, etc.)
   - `analyticsType`: The specific type of analytics being requested (spending_trends, income_analysis, etc.)
   - `filters`: Pre-processed filters derived from entities (date ranges, categories, etc.)
3. **Eliminates placeholder data**: No empty structures or placeholder values
4. **Enables separation of concerns**: UI can fetch actual analytics data separately using the provided metadata

This approach significantly reduces the payload size for ANALYTICS responses and simplifies client-side processing while providing all necessary information for subsequent data fetching.

## 10. Integration with Analytics API Service

To support the simplified ANALYTICS response format, a new Analytics API service has been developed which works in conjunction with the NLP service. This separation of concerns:

1. Allows the NLP service to focus on understanding and classifying user queries
2. Delegates the actual data processing and visualization to a specialized service
3. Improves overall system performance and maintainability

### Integration Architecture

```
User -> [UI] -> [NLP Service] -> Simplified Response -> [UI] -> [Analytics API] -> Visualization Data
```

In this flow:
1. The NLP service processes the user's query and returns metadata (analytics type, visualization type, filters)
2. The UI receives this metadata and makes a secondary request to the Analytics API
3. The Analytics API processes the request and returns visualization-ready data
4. The UI renders the visualization with the received data

### Analytics API Endpoints

The Analytics API service provides these key endpoints:

1. **GET /api/analytics/data**: Primary endpoint for fetching visualization data based on NLP metadata
2. **GET /api/analytics/types**: Retrieves available analytics types and their descriptions
3. **GET /api/analytics/visualizations**: Returns supported visualization types

Additionally, specialized endpoints are available for specific analytics categories:
- **GET /api/analytics/spending**: For spending-specific analytics
- **GET /api/analytics/income**: For income-specific analytics
- **GET /api/analytics/transactions**: For transaction-specific analytics

### Example Flow

1. User enters: "Show my spending trends for 2024"
2. NLP Service returns:
   ```json
   {
     "moduleCode": "ANALYTICS",
     "submoduleCode": "ANALYTICS_SPENDING",
     "flow": "ANALYTICS",
     "entities": {
       "year": "2024"
     },
     "visualizationType": "line_chart",
     "analyticsType": "spending_trends",
     "filters": {
       "startDate": "2024-01-01",
       "endDate": "2024-12-31"
     },
     "raw_text": "show my spending trends for 2024",
     "error": null
   }
   ```
3. UI makes a request to the Analytics API:
   ```
   GET /api/analytics/data?userId=12345&analyticsType=spending_trends&visualizationType=line_chart&moduleCode=ANALYTICS&submoduleCode=ANALYTICS_SPENDING&filters={"startDate":"2024-01-01","endDate":"2024-12-31"}&entities={"year":"2024"}
   ```
4. Analytics API returns data formatted for the specified visualization type

### Implementation Considerations

For detailed information on implementing UI components to work with this architecture, refer to the [UI Requirements Document](ui_requirements.md).

For details on the Analytics API service, refer to the [Analytics API Requirements](analytics_api_requirements.md) and [NLP-Analytics Integration Specification](nlp_analytics_integration.md).

## Testing

To test the optimized response, run:

```bash
python run_tests.py
```

This script tests various queries across different modules and verifies:
1. Only one ChatGPT API call is made for QUERY flow
2. No external API calls are made when module data is available locally
3. The response uses the simplified format
4. Module-specific entity extraction works correctly across different modules
5. Smart entity extraction is used for implied but not specified values
6. ANALYTICS flow returns the appropriate visualization type and filters

You can also run specific test types:

```bash
python run_tests.py --test-type query
python run_tests.py --test-type analytics
```

## Error Handling

The service returns appropriate HTTP status codes and error messages:

- 400: Bad Request (invalid input)
- 500: Internal Server Error (processing error)

## Development

The service is structured as follows:

- `app.py`: Main FastAPI application
- `config.py`: Configuration management
- `services/nlp_service.py`: NLP processing logic

## Security Considerations

- API keys should be stored securely in environment variables
- No sensitive data is persisted
- Input validation is performed on all requests 