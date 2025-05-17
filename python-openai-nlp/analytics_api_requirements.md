# Analytics API Service Requirements

## 1. Overview

A new dedicated Analytics API service is required to work with the simplified ANALYTICS response structure from the NLP service. This document outlines the requirements for this service, which will be responsible for fetching, processing, and delivering the actual analytics data for visualization based on the metadata returned by the NLP service.

## 2. Context

The NLP service has been optimized to return a simplified response for ANALYTICS flows:

```json
{
  "moduleCode": "ANALYTICS",
  "submoduleCode": "ANALYTICS_SPENDING",
  "flow": "ANALYTICS",
  "entities": {
    "year": 2024
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

The UI needs to make a secondary API call to fetch the actual visualization data based on this metadata. The Analytics API service will handle this request.

## 3. API Endpoint Requirements

### 3.1 Core Endpoints

#### GET /api/analytics/data

Fetches visualization data based on metadata from the NLP service.

**Request Parameters:**
- userId (required): The ID of the user requesting the data
- analyticsType (required): The type of analytics (e.g., "spending_trends", "income_analysis")
- visualizationType (required): The type of visualization (e.g., "bar_chart", "line_chart", "table")
- moduleCode (required): The module code (e.g., "ANALYTICS")
- submoduleCode (required): The submodule code (e.g., "ANALYTICS_SPENDING")
- filters (optional): JSON object containing filter parameters (e.g., startDate, endDate, category)
- entities (optional): JSON object containing the original entities from the NLP response

**Response:**
```json
{
  "title": "Spending Trends",
  "description": "Analysis of your spending patterns over time",
  "data": {
    "type": "line_chart",
    "configuration": {
      "xAxis": {
        "type": "time",
        "label": "Date"
      },
      "yAxis": {
        "type": "value",
        "label": "Amount"
      },
      "series": [
        {
          "name": "Spending",
          "data": [
            {"x": "2024-01-01", "y": 1250.45},
            {"x": "2024-02-01", "y": 1340.20},
            {"x": "2024-03-01", "y": 980.75},
            {"x": "2024-04-01", "y": 1420.30}
          ]
        }
      ]
    }
  },
  "summary": {
    "totalAmount": 4991.70,
    "averageAmount": 1247.93,
    "changePercentage": 13.6
  },
  "metadata": {
    "generatedAt": "2024-05-20T14:30:00Z",
    "appliedFilters": {
      "startDate": "2024-01-01",
      "endDate": "2024-04-30"
    }
  }
}
```

#### GET /api/analytics/types

Retrieves available analytics types and their descriptions.

**Response:**
```json
{
  "analyticsTypes": [
    {
      "code": "spending_trends",
      "title": "Spending Trends",
      "description": "Analysis of spending patterns over time",
      "supportedVisualizations": ["line_chart", "bar_chart"]
    },
    {
      "code": "income_analysis",
      "title": "Income Analysis",
      "description": "Overview of income sources and trends",
      "supportedVisualizations": ["line_chart", "pie_chart"]
    },
    // Additional analytics types...
  ]
}
```

#### GET /api/analytics/visualizations

Returns supported visualization types and their descriptions.

**Response:**
```json
{
  "visualizationTypes": [
    {
      "code": "line_chart",
      "title": "Line Chart",
      "description": "Displays data as a series of points connected by lines",
      "bestFor": ["time series", "trends", "continuous data"]
    },
    {
      "code": "bar_chart",
      "title": "Bar Chart",
      "description": "Displays data as rectangular bars",
      "bestFor": ["comparisons", "discrete categories"]
    },
    // Additional visualization types...
  ]
}
```

### 3.2 Specialized Endpoints

#### GET /api/analytics/spending

Specialized endpoint for spending analytics.

**Request Parameters:**
- userId (required): The ID of the user requesting the data
- period (optional): Time period to analyze (e.g., "month", "quarter", "year")
- startDate (optional): Start date for custom period (format: YYYY-MM-DD)
- endDate (optional): End date for custom period (format: YYYY-MM-DD)
- visualizationType (optional): Default is "line_chart"
- category (optional): Filter by spending category
- merchant (optional): Filter by merchant

#### GET /api/analytics/income

Specialized endpoint for income analytics.

**Request Parameters:**
- userId (required): The ID of the user requesting the data
- period (optional): Time period to analyze
- startDate (optional): Start date for custom period
- endDate (optional): End date for custom period
- visualizationType (optional): Default is "line_chart"
- source (optional): Filter by income source

#### GET /api/analytics/transactions

Specialized endpoint for transaction analytics.

**Request Parameters:**
- userId (required): The ID of the user requesting the data
- period (optional): Time period to analyze
- startDate (optional): Start date for custom period
- endDate (optional): End date for custom period
- visualizationType (optional): Default is "table"
- transactionType (optional): Filter by transaction type
- minAmount (optional): Minimum transaction amount
- maxAmount (optional): Maximum transaction amount

## 4. Functional Requirements

### 4.1 Data Processing

1. **Filter Application**: Apply filters from the NLP response to database queries
2. **Date Handling**: Support relative date ranges (e.g., "last month", "current quarter") and convert to absolute dates
3. **Entity Integration**: Use entities from the NLP response to enhance the data retrieval logic
4. **Aggregation**: Perform appropriate data aggregation based on the analytics type and visualization requirements
5. **Transformation**: Transform raw data into the format required by the specified visualization type

### 4.2 Visualization Support

1. **Dynamic Configuration**: Generate appropriate chart configuration based on the visualization type requested
2. **Adaptive Rendering**: Adjust data format to optimize for the specified visualization type
3. **Fallback Mechanisms**: Provide suitable fallbacks when requested visualizations are not optimal for the data
4. **Multi-series Support**: Handle multiple data series when appropriate (e.g., comparison analytics)

### 4.3 Data Source Requirements

1. **Transaction Data**: Access to user transaction history
2. **Account Data**: Access to user account information
3. **Category Data**: Access to transaction categorization
4. **Merchant Data**: Access to merchant information
5. **Budget Data**: Access to user budget information (if available)

## 5. Non-Functional Requirements

### 5.1 Performance

1. **Response Time**: API should respond with visualization data within 500ms
2. **Caching**: Implement caching for frequently accessed data
3. **Pagination**: Support pagination for large datasets (particularly for table visualizations)
4. **Query Optimization**: Optimize database queries for analytics operations

### 5.2 Security

1. **Authentication**: Require proper authentication for all API calls
2. **Authorization**: Ensure users can only access their own data
3. **Data Masking**: Mask sensitive financial data in responses when appropriate
4. **Input Validation**: Validate all input parameters to prevent injection attacks
5. **Rate Limiting**: Implement rate limiting to prevent abuse

### 5.3 Scalability

1. **Stateless Design**: Design the API to be stateless for horizontal scalability
2. **Asynchronous Processing**: Use asynchronous processing for complex analytics operations
3. **Resource Management**: Implement efficient resource management for memory-intensive operations

### 5.4 Reliability

1. **Error Handling**: Provide clear error messages with appropriate HTTP status codes
2. **Fallback Mechanisms**: Implement fallbacks for unavailable data sources
3. **Monitoring**: Include comprehensive logging and monitoring
4. **Circuit Breaking**: Implement circuit breaking for dependent services

## 6. Integration Points

### 6.1 NLP Service

- Receives metadata from the NLP service's simplified ANALYTICS response
- Uses this metadata to determine which data to fetch and how to format it

### 6.2 Data Services

- Connects to transaction database or transaction service API
- May connect to budget service API for budget-related analytics
- May connect to categorization service for enhanced category information

### 6.3 User Interface

- Provides data in a format ready for immediate visualization in the UI
- Adapts data format based on visualization requirements from the UI

## 7. Sample API Interactions

### Example 1: Spending Trends Analysis

**NLP Service Response:**
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

**Analytics API Request:**
```
GET /api/analytics/data?userId=12345&analyticsType=spending_trends&visualizationType=line_chart&moduleCode=ANALYTICS&submoduleCode=ANALYTICS_SPENDING&filters={"startDate":"2024-01-01","endDate":"2024-12-31"}&entities={"year":"2024"}
```

### Example 2: Transaction Analysis with Table Visualization

**NLP Service Response:**
```json
{
  "moduleCode": "ANALYTICS",
  "submoduleCode": "ANALYTICS_TRANSACTIONS",
  "flow": "ANALYTICS",
  "entities": {
    "period": "last month"
  },
  "visualizationType": "table",
  "analyticsType": "transaction_analysis",
  "filters": {
    "startDate": "2024-04-01",
    "endDate": "2024-04-30"
  },
  "raw_text": "show transaction details for last month in a table",
  "error": null
}
```

**Analytics API Request:**
```
GET /api/analytics/data?userId=12345&analyticsType=transaction_analysis&visualizationType=table&moduleCode=ANALYTICS&submoduleCode=ANALYTICS_TRANSACTIONS&filters={"startDate":"2024-04-01","endDate":"2024-04-30"}&entities={"period":"last month"}
```

## 8. Implementation Considerations

1. **Service Architecture**: Implement as a microservice with clearly defined boundaries
2. **Database Access**: Use efficient data access patterns (consider read replicas for analytics queries)
3. **Caching Strategy**: Implement multi-level caching (in-memory, distributed cache)
4. **API Gateway Integration**: Expose through the API gateway with appropriate routing and security
5. **Documentation**: Provide comprehensive API documentation with Swagger/OpenAPI
6. **Testing Strategy**: Include unit tests, integration tests, and performance tests
7. **Monitoring**: Implement comprehensive logging and monitoring for performance analysis 