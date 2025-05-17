# UI Requirements for Handling Simplified ANALYTICS Response

## 1. Overview

The Banking NLP Service has been optimized to use a simplified response format for ANALYTICS flow. This document outlines the UI changes required to accommodate this new response structure and efficiently fetch and display analytics visualizations.

## 2. Response Structure Changes

### Previous Analytics Response Structure
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

### New Simplified Analytics Response Structure
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

## 3. UI Component Changes

### 3.1 Analytics Detector
- Update the flow detection logic to check for `flow === "ANALYTICS"` and the presence of `visualizationType` and `analyticsType` fields
- Remove assumptions about data being included in the response

### 3.2 Analytics Visualization Component
- Update to handle the simplified response structure
- Implement a secondary data fetch using the new `/analytics/data` endpoint 
- Use `moduleCode`, `submoduleCode`, `analyticsType`, `visualizationType`, and `filters` from the response as parameters for the secondary request

### 3.3 Response Handler
- For ANALYTICS flow, extract the visualization metadata from the response
- Make a second API call to fetch the actual data needed for visualization
- Implement caching for visualization data to improve performance
- Handle error scenarios gracefully with appropriate fallback visualizations

## 4. Visualization Type Mapping

Map `visualizationType` values to UI components:

| visualizationType | UI Component       | Chart Library Component |
|-------------------|--------------------|-----------------------|
| table             | DataTable          | Material-UI Table     |
| bar_chart         | BarChart          | Chart.js or Recharts  |
| line_chart        | LineChart         | Chart.js or Recharts  |
| pie_chart         | PieChart          | Chart.js or Recharts  |
| area_chart        | AreaChart         | Chart.js or Recharts  |

## 5. Analytics Type Mapping

Map `analyticsType` values to appropriate titles and descriptions:

| analyticsType       | Display Title              | Description                                     |
|---------------------|----------------------------|-------------------------------------------------|
| spending_trends     | Spending Trends            | Analysis of spending patterns over time         |
| income_analysis     | Income Analysis            | Overview of income sources and trends           |
| budget_tracking     | Budget Tracking            | Comparison of actual spending against budget    |
| transaction_analysis| Transaction Analysis       | Detailed view of recent transactions            |
| distribution_analysis| Expense Distribution      | Breakdown of expenses by category               |
| comparison_analysis | Spending Comparison        | Comparison between different spending categories|
| trending_analysis   | Trend Analysis             | Identification of emerging financial patterns   |

## 6. Implementation Steps

1. Update the response handling logic to detect analytics responses
2. Implement the data fetching service for visualization data
3. Create or update visualization components to work with the new data structure
4. Add loading states for the secondary data fetch
5. Implement error handling and fallbacks
6. Add caching layer for analytics data to improve performance

## 7. Sample Code

### Example response handler:
```javascript
async function handleNLPResponse(response) {
  if (response.flow === "ANALYTICS") {
    // Extract visualization metadata
    const {
      moduleCode,
      submoduleCode,
      visualizationType,
      analyticsType,
      filters,
      entities
    } = response;
    
    // Fetch visualization data
    try {
      const visualizationData = await fetchAnalyticsData({
        userId: currentUser.id,
        moduleCode,
        submoduleCode,
        analyticsType,
        visualizationType,
        filters,
        entities
      });
      
      return {
        ...response,
        visualizationData
      };
    } catch (error) {
      console.error("Error fetching visualization data:", error);
      return {
        ...response,
        error: "Failed to load visualization data"
      };
    }
  }
  
  // Handle other flow types
  return response;
}
```

### Example visualization component:
```jsx
function AnalyticsVisualization({ response }) {
  const { visualizationType, analyticsType, visualizationData } = response;
  
  if (!visualizationData) {
    return <LoadingSpinner />;
  }
  
  switch (visualizationType) {
    case 'bar_chart':
      return <BarChart data={visualizationData} title={getTitle(analyticsType)} />;
    case 'line_chart':
      return <LineChart data={visualizationData} title={getTitle(analyticsType)} />;
    case 'pie_chart':
      return <PieChart data={visualizationData} title={getTitle(analyticsType)} />;
    case 'table':
      return <DataTable data={visualizationData} title={getTitle(analyticsType)} />;
    default:
      return <FallbackVisualization type={visualizationType} data={visualizationData} />;
  }
}
``` 