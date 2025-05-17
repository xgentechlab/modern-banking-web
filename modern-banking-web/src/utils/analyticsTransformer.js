import { startCase } from 'lodash';

const VISUALIZATION_MAPPINGS = {
  'line graph': 'line',
  'bar graph': 'bar',
  'pie chart': 'pie',
  'table': 'table'
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const transformDataForPieChart = (data, valueKey = 'value', formatValue) => {
  return Object.entries(data).map(([name, value]) => ({
    name: startCase(name.toLowerCase()),
    value: typeof value === 'object' ? value[valueKey] || value : value,
    percentage: 0,
    formattedValue: formatValue ? formatValue(typeof value === 'object' ? value[valueKey] || value : value) : undefined
  })).map(item => {
    const total = data.total || Object.values(data).reduce((sum, val) => 
      sum + (typeof val === 'object' ? (val[valueKey] || val) : val), 0);
    return {
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    };
  });
};

const transformMonthlyData = (monthlyTrends) => {
  return Object.entries(monthlyTrends).map(([month, data]) => ({
    date: month,
    amount: data.amount,
    count: data.count
  }));
};

const transformTransactionsByCategory = (transactions, valueKey = 'amount') => {
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const { category } = transaction;
    const value = valueKey === 'count' ? 1 : Math.abs(transaction[valueKey]);
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += value;
    return acc;
  }, {});

  return Object.entries(categoryTotals).map(([category, total]) => ({
    name: startCase(category.toLowerCase()),
    value: total,
    percentage: 0
  })).map(item => {
    const totalAmount = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    return {
      ...item,
      percentage: ((item.value / totalAmount) * 100).toFixed(1)
    };
  });
};

const transformTableData = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(row => ({
    ...row,
    date: formatDate(row.date),
    amount: formatCurrency(row.amount),
    category: startCase(row.category?.toLowerCase() || ''),
    type: row.type ? startCase(row.type.toLowerCase()) : '-'
  }));
};

const convertToChartJSConfig = (visualization) => {
  const { type, config } = visualization;

  switch (type.toLowerCase()) {
    case 'table': {
      return {
        type: 'table',
        data: transformTableData(config.data.data),
        options: {
          columns: [
            { 
              header: 'Date',
              accessor: 'date',
              width: '20%'
            },
            {
              header: 'Amount',
              accessor: 'amount',
              width: '25%',
              align: 'right'
            },
            {
              header: 'Category',
              accessor: 'category',
              width: '30%'
            },
            {
              header: 'Type',
              accessor: 'type',
              width: '25%'
            }
          ],
          title: {
            text: config.title.text || 'Transaction Details',
            style: {
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333333',
              textAlign: 'center',
              padding: '16px'
            }
          },
          style: {
            header: {
              backgroundColor: '#f5f5f5',
              color: '#333333',
              fontWeight: 'bold',
              padding: '12px 16px',
              borderBottom: '2px solid #e0e0e0'
            },
            cell: {
              padding: '12px 16px',
              borderBottom: '1px solid #e0e0e0'
            },
            alternateRow: {
              backgroundColor: '#fafafa'
            }
          },
          pagination: {
            enabled: true,
            pageSize: 10
          },
          sorting: {
            enabled: true,
            defaultSort: {
              field: 'date',
              order: 'desc'
            }
          }
        }
      };
    }
    case 'pie': {
      const series = config.series[0];
      return {
        type: 'pie',
        data: {
          labels: series.data.map(item => startCase(item.name.toLowerCase())),
          datasets: [{
            data: series.data.map(item => item.y),
            backgroundColor: config.colors || series.data.map(item => item.color),
            borderColor: 'white',
            borderWidth: 2
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: config.title.text,
              font: {
                size: parseInt(config.title.style?.fontSize) || 16,
                weight: config.title.style?.fontWeight || 'bold'
              },
              color: config.title.style?.color || '#333333',
              align: config.title.align || 'center',
              padding: 20
            },
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw;
                  const percentage = ((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                  return `${label}: ${percentage}%`;
                }
              }
            }
          },
          layout: {
            padding: 20
          },
          responsive: true
        }
      };
    }
    case 'line': {
      const series = config.series[0];
      return {
        type: 'line',
        data: {
          labels: series.data.map(item => item[0] || item.x || item.timestamp ),
          datasets: [{
            label: series.name,
            data: series.data.map(item => item[1] || item.y || item.value),
            borderColor: config.colors?.[0] || '#2196f3',
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
              text: config.title.text,
              font: {
                size: parseInt(config.title.style?.fontSize) || 16,
                weight: config.title.style?.fontWeight || 'bold'
              },
              color: config.title.style?.color || '#333333',
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
                text: config.xAxis.label
              }
            },
            y: {
              title: {
                display: true,
                text: config.yAxis.label
              },
              beginAtZero: true
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      };
      
      return config;
    }
    case 'bar': {
      // Keep existing bar chart config handling
      return config;
    }
    default:
      return config;
  }
};

const getVisualizationConfig = (type, analyticsType, summary) => {
  const baseConfig = {
    spending: {
      title: `Spending Analysis (${formatCurrency(summary.totalAmount)})`,
      xAxis: { label: 'Month' },
      yAxis: { label: 'Amount (₹)' },
      tooltip: {
        formatter: (value, name, props) => [
          `${name}: ${formatCurrency(props.payload.value)} (${props.payload.percentage || ''}${props.payload.percentage ? '%' : ''})`
        ]
      }
    },
    transactions: {
      title: `Transaction Analysis (Total: ${summary.totalTransactions})`,
      xAxis: { label: 'Month' },
      yAxis: { label: 'Number of Transactions' },
      tooltip: {
        formatter: (value, name, props) => [
          `${name}: ${props.payload.value} transactions (${props.payload.percentage || ''}${props.payload.percentage ? '%' : ''})`
        ]
      }
    },
    category: {
      title: 'Transactions by Category',
      xAxis: { label: 'Category' },
      yAxis: { label: 'Number of Transactions' },
      tooltip: {
        formatter: (value, name, props) => [
          `${name}: ${props.payload.value} transactions (${props.payload.percentage}%)`
        ]
      }
    },
    channel: {
      title: 'Transactions by Channel',
      xAxis: { label: 'Channel' },
      yAxis: { label: 'Number of Transactions' },
      tooltip: {
        formatter: (value, name, props) => [
          `${name}: ${props.payload.value} transactions (${props.payload.percentage}%)`
        ]
      }
    },
    income: {
      title: 'Income Analysis',
      xAxis: { label: 'Month' },
      yAxis: { label: 'Amount (₹)' },
      tooltip: {
        formatter: (value, name, props) => [
          `${name}: ${formatCurrency(props.payload.value)} (${props.payload.percentage || ''}${props.payload.percentage ? '%' : ''})`
        ]
      }
    }
        
  };

  const config = baseConfig[analyticsType];
  
  switch (type) {
    case 'pie':
      return {
        type,
        title: config.title,
        config: {
          tooltip: config.tooltip
        }
      };
    case 'bar':
      return {
        type,
        title: config.title,
        config: {
          xAxis: {
            dataKey: 'name',
            label: config.xAxis.label
          },
          yAxis: {
            label: config.yAxis.label
          },
          bars: [{
            dataKey: 'value',
            name: analyticsType === 'spending' ? 'Amount' : 'Transactions'
          }],
          tooltip: config.tooltip
        }
      };
    case 'line':
    default:
      return {
        type: 'line',
        title: config.title,
        config: {
          xAxis: {
            dataKey: 'date',
            label: 'Month'
          },
          yAxis: {
            label: config.yAxis.label
          },
          lines: [{
            dataKey: analyticsType === 'spending' ? 'amount' : 'count',
            name: analyticsType === 'spending' ? 'Amount' : 'Transaction Count'
          }],
          tooltip: config.tooltip
        }
      };
  }
};

const getVisualizationData = (type, analyticsType, { analytics, data: transactions }) => {
  switch (type) {
    case 'pie':
      if (analyticsType === 'spending') {
        return transformTransactionsByCategory(transactions, 'amount');
      } else if (analyticsType === 'transactions') {
        return transformTransactionsByCategory(transactions, 'count');
      } else if (analyticsType === 'category') {
        return transformDataForPieChart(analytics.transactionsByCategory);
      } else {
        return transformDataForPieChart(analytics.transactionsByChannel);
      }
    case 'bar':
      if (analyticsType === 'spending') {
        return transformTransactionsByCategory(transactions, 'amount');
      } else if (analyticsType === 'transactions') {
        return transformTransactionsByCategory(transactions, 'count');
      } else if (analyticsType === 'category') {
        return transformDataForPieChart(analytics.transactionsByCategory);
      } else {
        return transformDataForPieChart(analytics.transactionsByChannel);
      }
    case 'line':
    default:
      return transformMonthlyData(analytics.monthlyTrends);
  }
};

export const transformAnalyticsResponse = (nlpResponse) => {
  const { resolution, entities } = nlpResponse;
  
  if (resolution?.is_resolved && resolution?.data?.visualization) {
    const { visualization, summary } = resolution.data;
    
    // Convert the visualization config to Chart.js format
    const chartJSConfig = convertToChartJSConfig(visualization);
    
    return {
      ...nlpResponse,
      visualization: {
        type: visualization.type,
        title: visualization.config.title?.text || 'Analytics',
        config: chartJSConfig
      },
      // Include summary data for the analytics card
      summary: {
        totalTransactions: summary.totalTransactions,
        totalAmount: summary.totalAmount,
        averageTransactionValue: summary.averageTransactionValue
      },
      // Include analytics data for additional insights
      analytics: resolution.data.analytics
    };
  }

  // Return a default state if visualization is not available
  return {
    ...nlpResponse,
    visualization: {
      type: 'line',
      title: 'Loading Analytics...',
      config: {
        type: 'line',
        data: {
          datasets: []
        },
        options: {
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
                text: 'Month'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Value'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Loading...'
            }
          }
        }
      }
    }
  };
}; 