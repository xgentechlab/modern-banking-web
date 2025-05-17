import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, CircularProgress, Typography, Divider, Collapse, IconButton } from '@mui/material';
import styled from 'styled-components';
import VisualizationRenderer from '../visualizations/VisualizationRenderer';
import ErrorMessage from '../../../common/ErrorMessage';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useCustomer } from '../../../../context/CustomerContext';
import { fetchAnalyticsData } from '../../../../services/analyticsService';
const StyledCard = styled(Card)`
  width: 100%;
  min-height: 400px;
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const SummaryContainer = styled(Box)`
  margin-bottom: 2rem;
`;

const SummaryGrid = styled(Grid)`
  margin-bottom: 1rem;
`;

const SummarySection = styled(Box)`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
`;

const SummaryItem = styled(Box)`
  text-align: center;
  
  .label {
    color: ${props => props.theme.palette.text.secondary};
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  .value {
    color: ${props => props.theme.palette.primary.main};
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const SummaryHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Function to get display title based on analyticsType
const getAnalyticsTitle = (analyticsType) => {
  const titles = {
    'spending_trends': 'Spending Trends',
    'income_analysis': 'Income Analysis',
    'budget_tracking': 'Budget Tracking',
    'transaction_analysis': 'Transaction Analysis',
    'distribution_analysis': 'Expense Distribution',
    'comparison_analysis': 'Spending Comparison',
    'trending_analysis': 'Trend Analysis'
  };
  
  return titles[analyticsType] || 'Analytics';
};

// Map visualizationType values to corresponding chart types
const mapVisualizationType = (visualizationType) => {
  const mapping = {
    'table': 'table',
    'bar_chart': 'bar',
    'line_chart': 'line',
    'pie_chart': 'pie',
    'area_chart': 'line'
  };
  
  return mapping[visualizationType] || 'line';
};

// Transform API response data into chart.js format
const transformApiResponse = (responseData) => {
  if (!responseData) return null;
  
  console.log('Transforming API response:', responseData);
  
  const { title, description, data, summary, metadata } = responseData;
  
  try {
    // Determine chart type from data.type
    const chartType = data?.type?.toLowerCase() || 'line_chart';
    
    // Handle different chart types with their specific data structures
    if (chartType === 'pie_chart' || chartType === 'pie') {
      // Extract pie chart data
      const pieData = data?.configuration?.series?.[0]?.data || [];
      
      if (pieData.length === 0) {
        console.warn('No valid data points found in the pie chart response');
        return createEmptyDataResponse(title, summary, metadata);
      }
      
      // Extract names and values from pie data
      const labels = pieData.map(item => item.name);
      const values = pieData.map(item => item.value);
      
      // Generate colors for pie slices
      const backgroundColors = generatePieColors(pieData.length);
      
      // Create a properly formatted visualization configuration for pie chart
      const visualization = {
        type: 'pie',
        title: title || 'Analytics',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            borderColor: '#ffffff',
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: title || 'Analytics',
              font: {
                size: 16,
                weight: 'bold'
              },
              color: '#333333',
              padding: 20
            },
            legend: {
              position: 'right',
              align: 'center'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000
          }
        }
      };
      
      return {
        summary,
        data: pieData, // Use the pie data
        visualization,
        analytics: {
          transactionsByType: {
            debit: summary?.totalDebitTransactions || 0,
            credit: summary?.totalCreditTransactions || 0
          },
          transactionsByChannel: metadata?.transactionsByChannel || {}
        }
      };
    } else {
      // Default to empty arrays if data structure is not as expected (for line/bar charts)
      const seriesData = data?.configuration?.series?.[0]?.data || [];
      
      // Filter out any invalid data points and ensure x values are valid dates for time series
      const validSeriesData = seriesData.filter(point => 
        point && point.x && !isNaN(new Date(point.x).getTime()) && point.y !== undefined
      );
      
      if (validSeriesData.length === 0) {
        console.warn('No valid data points found in the response');
        return createEmptyDataResponse(title, summary, metadata);
      }
      
      // Extract labels (x values) and data points (y values) from the series data
      const labels = validSeriesData.map(point => point.x);
      const values = validSeriesData.map(point => point.y);
      
      // Create a properly formatted visualization configuration for chart.js
      const visualization = {
        type: mapVisualizationType(chartType),
        title: title || 'Analytics',
        data: {
          labels: labels,
          datasets: [{
            label: data?.configuration?.series?.[0]?.name || 'Spending',
            data: values,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: title || 'Analytics',
              font: {
                size: 16,
                weight: 'bold'
              },
              color: '#333333',
              padding: 20
            },
            legend: {
              position: 'top',
              align: 'center'
            },
            filler: {
              propagate: true
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month',
                parser: 'yyyy-MM-dd',
                tooltipFormat: 'MMMM yyyy',
                displayFormats: {
                  month: 'MMM yyyy'
                }
              },
              title: {
                display: true,
                text: data?.configuration?.xAxis?.label || 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: data?.configuration?.yAxis?.label || 'Amount'
              },
              beginAtZero: true
            }
          },
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000 // Reduce animation duration to help with performance
          }
        }
      };
      
      return {
        summary,
        data: validSeriesData, // Use the filtered valid data
        visualization,
        analytics: {
          transactionsByType: { // Placeholder data if not available in the response
            debit: summary?.totalDebitTransactions || 0,
            credit: summary?.totalCreditTransactions || 0
          },
          transactionsByChannel: metadata?.transactionsByChannel || {}
        }
      };
    }
  } catch (error) {
    console.error('Error transforming API response:', error);
    return createEmptyDataResponse(title, summary, metadata, true);
  }
};

// Helper function to create an empty data response
const createEmptyDataResponse = (title, summary, metadata, isError = false) => {
  return {
    summary: summary || {},
    data: [],
    visualization: {
      type: 'line',
      title: isError ? 'Error Loading Data' : (title || 'Analytics'),
      data: { labels: [], datasets: [] },
      options: {
        plugins: {
          title: {
            display: true,
            text: isError ? 'Error processing data' : 'No data available',
            font: { size: 16, weight: 'bold' },
            color: isError ? '#d32f2f' : '#333333',
            padding: 20
          }
        }
      }
    },
    analytics: {
      transactionsByType: { debit: 0, credit: 0 },
      transactionsByChannel: metadata?.transactionsByChannel || {}
    }
  };
};

// Generate colors for pie chart slices
const generatePieColors = (count) => {
  const baseColors = [
    '#2196f3', // Blue
    '#ff9800', // Orange
    '#4caf50', // Green
    '#f44336', // Red
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#ffeb3b', // Yellow
    '#795548', // Brown
    '#607d8b', // Blue Grey
    '#e91e63'  // Pink
  ];
  
  // If we have more slices than base colors, generate additional colors
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  const colors = [...baseColors];
  
  // Generate additional colors by modifying existing ones
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.5) % 360; // Use golden ratio to space colors
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  
  return colors;
};

const AnalyticsCard = ({ nlpResponse }) => {
  const [showSummary, setShowSummary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  
  console.log('AnalyticsCard rendered with nlpResponse:', nlpResponse);
  const { customer } = useCustomer();
  
  // Extract data from the new NLP response structure
  const { 
    moduleCode, 
    submoduleCode, 
    flow, 
    entities, 
    visualizationType, 
    analyticsType, 
    filters 
  } = nlpResponse || {};

  // Fallback analyticsType by deriving from submoduleCode if not provided directly
  const derivedAnalyticsType = !analyticsType && submoduleCode ? 
    submoduleCode.replace('ANALYTICS_', '').toLowerCase() + '_trends' : 
    analyticsType;
  
  console.log('Extracted properties:', {
    moduleCode, 
    submoduleCode, 
    flow, 
  entities,
    visualizationType, 
    analyticsType: analyticsType || derivedAnalyticsType, 
    filters
  });
  
  // Fetch analytics data when the component mounts or when the response changes
  useEffect(() => {
    console.log('useEffect triggered with:', {
      moduleCode, 
      submoduleCode, 
      flow: flow || (moduleCode === 'ANALYTICS' ? 'ANALYTICS' : undefined),
      visualizationType: visualizationType || (submoduleCode === 'ANALYTICS_SPENDING' ? 'line_chart' : undefined),
      analyticsType: analyticsType || derivedAnalyticsType
    });
    
    // Derive flow from moduleCode if not explicitly provided
    const derivedFlow = flow || (moduleCode === 'ANALYTICS' ? 'ANALYTICS' : undefined);
    
    // Derive visualizationType if not explicitly provided
    const derivedVisualizationType = visualizationType || 
      (submoduleCode === 'ANALYTICS_SPENDING' ? 'line_chart' : undefined);
    
    const shouldFetchData = derivedFlow === 'ANALYTICS' && 
      (derivedVisualizationType || submoduleCode?.startsWith('ANALYTICS_'));
    
    console.log('Should fetch data?', shouldFetchData);
    
    if (shouldFetchData) {
      setLoading(true);
      setError(null);
      
      fetchAnalyticsData({
        moduleCode,
        submoduleCode,
        analyticsType: analyticsType || derivedAnalyticsType,
        visualizationType: derivedVisualizationType,
        filters: filters || { year: entities?.year },
        userId: customer?.profile.id,
        entities
      })
        .then(data => {
          console.log('Successfully fetched analytics data:', data);
          // Transform the API response to the format expected by the component
          const transformedData = transformApiResponse(data);
          setAnalyticsData(transformedData);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error in useEffect analytics fetch:', err);
          setError(err.message || 'Failed to load analytics data');
          setLoading(false);
        });
    } else {
      console.log('Skipping data fetch due to missing conditions');
    }
  }, [moduleCode, submoduleCode, flow, visualizationType, analyticsType || derivedAnalyticsType, filters, entities]);

  console.log('Current state:', { loading, error, analyticsData });

  if (loading) {
    return (
      <StyledCard>
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard>
        <CardContent>
          <ErrorMessage
            message={`Failed to load analytics data: ${error}`}
            suggestion="Please try again or contact support if the issue persists."
            showRetry={true}
          />
        </CardContent>
      </StyledCard>
    );
  }

  // If no analytics data yet, show a loading message
  if (!analyticsData) {
    return (
      <StyledCard>
        <CardContent>
          <Typography variant="h6" align="center">
            Preparing your analytics...
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 2 }}>
            Response received but waiting for data. 
            Flow: {flow || (moduleCode === 'ANALYTICS' ? 'ANALYTICS' : undefined)}, 
            Type: {visualizationType || (submoduleCode === 'ANALYTICS_SPENDING' ? 'line_chart' : undefined)}, 
            Analytics: {analyticsType || derivedAnalyticsType}
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  const { summary, data, visualization } = analyticsData;

  console.log('Rendering with analyticsData:', { summary, data, visualization });

  const renderSummary = (type, summary) => {
    if (!summary) return null;

    const summaryConfig = {
      line: [
        { label: 'Total Amount', value: formatCurrency(summary.totalAmount) },
        { label: 'Average', value: formatCurrency(summary.averageAmount) },
        { label: 'Change', value: `${summary.changePercentage}%` }
      ],
      pie: [
        { label: 'Total Amount', value: formatCurrency(summary.totalAmount) },
        { label: 'Top Category', value: summary.topCategory },
        { label: 'Share', value: `${summary.topCategoryPercentage}%` }
      ],
      bar: [
        { label: 'Total Amount', value: formatCurrency(summary.comparisons?.reduce((acc, curr) => acc + curr.total, 0) || 0) },
        { label: 'Change', value: `${summary.percentageChange}%` }
      ],
      table: [
        { label: 'Total Amount', value: formatCurrency(summary.totalAmount) },
        { label: 'Average', value: formatCurrency(summary.averageAmount) }
      ]
    };

    const items = summaryConfig[type] || [];

    return (
      <SummarySection>
        {items.map((item, index) => (
          <SummaryItem key={index}>
            <Typography className="label">{item.label}</Typography>
            <Typography className="value">{item.value}</Typography>
          </SummaryItem>
        ))}
      </SummarySection>
    );
  };

  return (
    <StyledCard>
      <CardContent>
        {/* Summary Section */}
        <SummaryContainer>
          <SummaryHeader>
            <Typography variant="h6" color="primary">
              {visualization?.title || getAnalyticsTitle(analyticsType || derivedAnalyticsType)}
          </Typography>
            <IconButton
              onClick={() => setShowSummary(!showSummary)}
              size="small"
              aria-label={showSummary ? "Collapse summary" : "Expand summary"}
            >
              {showSummary ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </SummaryHeader>
          
          <Collapse in={showSummary}>
          <SummaryGrid container spacing={3}>
            {renderSummary(visualization?.type?.toLowerCase() || 'line', summary)}
          </SummaryGrid>

          {/* Transaction Type Distribution */}
            
          </Collapse>
        </SummaryContainer>

        <Divider sx={{ my: 3 }} />

        {/* Visualization Section */}
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            {visualization?.title || getAnalyticsTitle(analyticsType || derivedAnalyticsType)}
          </Typography>
          <VisualizationRenderer
            type={visualization?.type || mapVisualizationType(visualizationType || 'line_chart')}
            data={data}
            config={visualization}
          />
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default AnalyticsCard; 