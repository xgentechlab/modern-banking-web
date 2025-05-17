import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { styled } from '@mui/material/styles';
import TableVisualization from './TableVisualization';
import { Box, CircularProgress, Typography } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Manually destroy all existing chart instances on component load
// This helps prevent the "Canvas already in use" error
try {
  const chartInstances = ChartJS.instances || {};
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
    }
  });
} catch (error) {
  console.error('Error cleaning up chart instances:', error);
}

const VisualizationContainer = styled('div')({
  width: '100%',
  height: '100%',
  minHeight: '400px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px'
});

const NoDataContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '400px',
  width: '100%',
  padding: '16px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
});

// Generate a unique ID for each chart instance
const generateChartId = () => `chart-${Math.random().toString(36).substring(2, 9)}`;

const VisualizationRenderer = ({ type, data, config }) => {
  const chartRef = useRef(null);
  const [chartId] = useState(generateChartId());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate config and chart data
  const isConfigValid = config && 
    config.data && 
    config.options &&
    ((config.data.datasets && Array.isArray(config.data.datasets) && config.data.datasets.length > 0) || 
     (type === 'table' && Array.isArray(config.data) && config.data.length > 0));

  // Effect to clean up chart instance on unmount
  useEffect(() => {
    return () => {
      try {
        // Clean up the chart instance when the component unmounts
        if (chartRef.current && chartRef.current.destroy) {
          chartRef.current.destroy();
        }
        
        // Backup cleanup using Chart registry
        const chartInstance = ChartJS.getChart(chartId);
        if (chartInstance) {
          chartInstance.destroy();
        }
      } catch (error) {
        console.error('Error destroying chart:', error);
      }
    };
  }, [chartId]);

  // Handle loading state
  if (isLoading) {
    return (
      <VisualizationContainer>
        <CircularProgress />
      </VisualizationContainer>
    );
  }

  // Handle error state
  if (error) {
    return (
      <VisualizationContainer>
        <Typography color="error">{error}</Typography>
      </VisualizationContainer>
    );
  }

  // Handle invalid/missing config
  if (!isConfigValid) {
    return (
      <NoDataContainer>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No data available
        </Typography>
        <Typography variant="body2" color="textSecondary">
          There is no data available for this visualization.
        </Typography>
      </NoDataContainer>
    );
  }

  const chartComponents = {
    line: () => (
      <Line 
        ref={chartRef}
        id={chartId}
        data={config.data} 
        options={config.options}
        redraw={false} // Avoid unnecessary redraws
      />
    ),
    bar: () => (
      <Bar 
        ref={chartRef}
        id={chartId}
        data={config.data} 
        options={config.options}
        redraw={false}
      />
    ),
    pie: () => (
      <Pie 
        ref={chartRef}
        id={chartId}
        data={config.data} 
        options={config.options}
        redraw={false}
      />
    ),
    table: () => <TableVisualization config={config} />,
  };

  // Safely render the visualization
  const renderVisualization = () => {
    try {
      const ChartComponent = chartComponents[type?.toLowerCase()] || (() => (
        <Typography variant="body1">
          Unsupported visualization type: {type}
        </Typography>
      ));
      
      return <ChartComponent />;
    } catch (error) {
      console.error('Error rendering visualization:', error);
      return (
        <Typography color="error">
          Error rendering visualization: {error.message}
        </Typography>
      );
    }
  };

  return (
    <VisualizationContainer>
      {renderVisualization()}
    </VisualizationContainer>
  );
};

export default VisualizationRenderer; 