import { createGlobalStyle } from 'styled-components';
import { themeConfig } from './theme';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: ${themeConfig.colors.background.default};
    color: ${themeConfig.colors.text.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Modern scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${themeConfig.colors.background.default};
  }

  ::-webkit-scrollbar-thumb {
    background: ${themeConfig.colors.grey[300]};
    border-radius: ${themeConfig.borderRadius.medium};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${themeConfig.colors.grey[400]};
  }

  /* Smooth scrolling for the entire page */
  html {
    scroll-behavior: smooth;
  }
`; 