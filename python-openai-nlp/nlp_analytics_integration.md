# NLP Service to Analytics API Integration Specification

## 1. Overview

This document specifies the integration between the existing NLP service (which now returns simplified ANALYTICS responses) and the new Analytics API service. It defines how the two services will interact to provide a complete analytics experience to end users.

## 2. System Context

### 2.1 Current Architecture

```
User -> [UI] -> [NLP Service] -> [Analytics Engine] -> Response
```

### 2.2 New Architecture

```
User -> [UI] -> [NLP Service] -> Simplified Response -> [UI] -> [Analytics API] -> Visualization Data
```

In this new flow:
1. The NLP service processes the user's query and returns metadata (analytics type, visualization type, filters)
2. The UI receives this metadata and makes a secondary request to the Analytics API
3. The Analytics API processes the request and returns visualization-ready data
4. The UI renders the visualization with the received data

## 3. Interface Definition

### 3.1 NLP Service Output Format

The NLP service returns simplified ANALYTICS responses in the following format:

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

### 3.2 Analytics API Input Requirements

The Analytics API expects the following parameters:
- userId: From the client context
- moduleCode: From NLP response
- submoduleCode: From NLP response
- analyticsType: From NLP response
- visualizationType: From NLP response
- filters: From NLP response
- entities: From NLP response (for additional context)

## 4. Integration Patterns

### 4.1 Direct UI Integration (Recommended)

```
[UI] -> [NLP Service] -> Simplified Response
[UI] -> [Analytics API] -> Visualization Data
```

In this pattern:
- The UI is responsible for making both API calls
- The UI handles error scenarios and retries
- The UI manages the loading state between calls

**Advantages:**
- Lower backend coupling
- Transparent to the end user
- Can implement client-side caching for improved performance

**Implementation Notes:**
1. The UI should extract the analytics metadata from the NLP response
2. The UI should construct the Analytics API request with the extracted metadata
3. The UI should implement error handling and loading states
4. The UI can cache similar requests to improve performance

### 4.2 Backend Integration (Alternative)

```
[UI] -> [API Gateway] -> [NLP Service] -> [Analytics Service] -> Complete Response
```

In this pattern:
- The NLP service calls the Analytics API internally
- The UI receives a complete response with visualization data
- Additional backend complexity but simpler frontend logic

**Advantages:**
- Single request from UI perspective
- Simplified error handling for UI
- Potential for backend caching and optimization

**Implementation Notes:**
1. The NLP service would need to be modified to call the Analytics API
2. Additional error handling would be required in the NLP service
3. Response times may be longer for the initial request

## 5. Data Mapping

### 5.1 Analytics Type Mapping

The NLP service's `analyticsType` value maps directly to the Analytics API's `analyticsType` parameter:

| NLP analyticsType     | Analytics API analyticsType |
|-----------------------|----------------------------|
| spending_trends       | spending_trends            |
| income_analysis       | income_analysis            |
| budget_tracking       | budget_tracking            |
| transaction_analysis  | transaction_analysis       |
| distribution_analysis | distribution_analysis      |
| comparison_analysis   | comparison_analysis        |
| trending_analysis     | trending_analysis          |

### 5.2 Visualization Type Mapping

The NLP service's `visualizationType` value maps directly to the Analytics API's `visualizationType` parameter:

| NLP visualizationType | Analytics API visualizationType |
|-----------------------|--------------------------------|
| table                 | table                          |
| bar_chart             | bar_chart                      |
| line_chart            | line_chart                     |
| pie_chart             | pie_chart                      |
| area_chart            | area_chart                     |

### 5.3 Filter Mapping

The filters object from the NLP service can be directly passed to the Analytics API. Common filters include:

| Filter Name     | Description                         | Example Value    |
|-----------------|-------------------------------------|------------------|
| startDate       | Start date for analysis period      | "2024-01-01"     |
| endDate         | End date for analysis period        | "2024-12-31"     |
| category        | Transaction category                | "groceries"      |
| transactionType | Type of transaction                 | "debit"          |
| merchant        | Merchant name                       | "Amazon"         |
| minAmount       | Minimum transaction amount          | 50.00            |
| maxAmount       | Maximum transaction amount          | 500.00           |

## 6. Error Handling

### 6.1 NLP Service Errors

If the NLP service fails to identify the analytics type or other required parameters, it will return:

```json
{
  "error": "Could not determine analytics type from request"
}
```

### 6.2 Analytics API Errors

The Analytics API should return appropriate HTTP status codes for errors:
- 400: Bad Request (invalid parameters)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found (requested data not available)
- 500: Internal Server Error

Example error response:
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid analytics type: unknown_type",
    "details": "Supported analytics types are: spending_trends, income_analysis, etc."
  }
}
```

## 7. Security Considerations

### 7.1 Authentication

Both services must validate authentication:
1. NLP Service: Validates user authentication for the initial request
2. Analytics API: Requires authentication token in all requests

### 7.2 Authorization

1. NLP Service: Checks user permission for analytics access
2. Analytics API: Validates that the user has permission to access the requested data
3. Both services should enforce that users can only access their own data

### 7.3 Data Privacy

1. No sensitive data should be included in logs
2. All communication should be over HTTPS
3. The Analytics API should implement data masking for sensitive financial information in responses

## 8. Performance Considerations

### 8.1 Caching

1. UI should cache NLP responses for similar queries
2. Analytics API should implement caching for visualization data
3. Cache invalidation should occur when user data changes

### 8.2 Request Optimization

1. UI should batch requests where possible
2. Analytics API should support data pagination for large datasets
3. All endpoints should be optimized for minimum response time

## 9. Example Integration Flow

### 9.1 End-to-End Flow

1. User enters: "Show my spending trends for 2024"
2. UI sends this text to NLP Service
3. NLP Service processes the request and returns:
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
4. UI detects ANALYTICS flow and extracts metadata
5. UI displays initial loading state for visualization
6. UI sends request to Analytics API:
   ```
   GET /api/analytics/data?userId=12345&analyticsType=spending_trends&visualizationType=line_chart&moduleCode=ANALYTICS&submoduleCode=ANALYTICS_SPENDING&filters={"startDate":"2024-01-01","endDate":"2024-12-31"}&entities={"year":"2024"}
   ```
7. Analytics API processes the request and returns visualization data
8. UI renders the visualization using the returned data

### 9.2 Error Handling Flow

1. User enters: "Show my investment performance for biotechnology sector"
2. NLP Service identifies this as ANALYTICS but can't find required entities
3. NLP Service returns:
   ```json
   {
     "moduleCode": "ANALYTICS",
     "submoduleCode": "ANALYTICS_INVESTMENT",
     "flow": "ANALYTICS",
     "entities": {
       "sector": "biotechnology"
     },
     "visualizationType": "bar_chart",
     "analyticsType": "investment_performance",
     "filters": {},
     "raw_text": "Show my investment performance for biotechnology sector",
     "error": null
   }
   ```
4. UI sends request to Analytics API
5. Analytics API attempts to process but lacks investment data for the sector
6. Analytics API returns error:
   ```json
   {
     "error": {
       "code": "DATA_NOT_AVAILABLE",
       "message": "Investment data for biotechnology sector not available",
       "details": "The requested investment sector data is not available for your portfolio"
     }
   }
   ```
7. UI displays appropriate error message to user

## 10. Implementation Timeline and Dependencies

1. NLP Service Updates: 
   - Simplified ANALYTICS response format ✅ (Already implemented)
   - Documentation for UI integration ⏳ (In progress)

2. Analytics API Development:
   - Core API Endpoints ⏳ (To be implemented)
   - Data Processing Logic ⏳ (To be implemented)
   - Integration with Data Sources ⏳ (To be implemented)

3. UI Updates:
   - Response Handling Logic ⏳ (To be implemented)
   - Visualization Components ⏳ (To be implemented)
   - Secondary Request Implementation ⏳ (To be implemented) 