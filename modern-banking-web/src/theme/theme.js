import { createTheme } from '@mui/material/styles';

export const themeConfig = {
  colors: {
    primary: {
      main: '#d65420', // Main purple color from the design
      light: '#9E7BFF',
      dark: '#5C35CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4CAF50', // Green accent color
      light: '#6FBF73',
      dark: '#357A38',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
      light: '#6FBF73',
      dark: '#357A38',
    },
    error: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#CC4B4B',
    },
    background: {
      default: '#F8F9FE',
      paper: '#FFFFFF',
      card: 'rgba(255, 255, 255, 0.8)',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
    },
    grey: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
  },
  spacing: (factor) => `${0.25 * factor}rem`,
  borderRadius: {
    small: '0.375rem',
    medium: '0.75rem',
    large: '0.75rem',
    circle: '50%',
  },
  shadows: {
    card: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    dropdown: '0px 10px 30px rgba(0, 0, 0, 0.1)',
    button: '0px 4px 10px rgba(124, 77, 255, 0.2)',
  },
  transitions: {
    quick: '0.15s ease-in-out',
    medium: '0.25s ease-in-out',
    slow: '0.35s ease-in-out',
  },
};

export const theme = createTheme({
  palette: {
    primary: themeConfig.colors.primary,
    secondary: themeConfig.colors.secondary,
    success: themeConfig.colors.success,
    error: themeConfig.colors.error,
    background: themeConfig.colors.background,
    text: themeConfig.colors.text,
    grey: themeConfig.colors.grey,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: themeConfig.borderRadius.medium,
          padding: '0.5rem 1.5rem',
          boxShadow: themeConfig.shadows.button,
          transition: themeConfig.transitions.quick,
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: themeConfig.shadows.button,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: themeConfig.borderRadius.large,
          boxShadow: themeConfig.shadows.card,
          background: themeConfig.colors.background.card,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: themeConfig.borderRadius.medium,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            backgroundColor: `${themeConfig.colors.primary.main}15`, // 15% opacity
            color: themeConfig.colors.primary.main,
            borderColor: themeConfig.colors.primary.main,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: `${themeConfig.colors.secondary.main}15`,
            color: themeConfig.colors.secondary.main,
            borderColor: themeConfig.colors.secondary.main,
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: '#1976d215',
            color: '#1976d2',
            borderColor: '#1976d2',
          },
          '&.MuiChip-colorDefault': {
            backgroundColor: `${themeConfig.colors.grey[300]}50`,
            color: themeConfig.colors.text.primary,
            borderColor: themeConfig.colors.grey[300],
          },
        },
        icon: {
          color: 'inherit',
        },
        label: {
          padding: '0 12px',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
}); 