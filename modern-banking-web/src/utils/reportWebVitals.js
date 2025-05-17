import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Cumulative Layout Shift
    onCLS(onPerfEntry);
    // First Input Delay
    onFID(onPerfEntry);
    // First Contentful Paint
    onFCP(onPerfEntry);
    // Largest Contentful Paint
    onLCP(onPerfEntry);
    // Time to First Byte
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals; 