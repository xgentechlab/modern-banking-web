import React, { useState } from 'react';
import Login from './components/Login/Login';
import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { GlobalStyles } from './theme/globalStyles';
import { BrowserRouter as Router } from 'react-router-dom';
import { CustomerProvider } from './context/CustomerContext';
import { ModuleProvider } from './context/ModuleContext';
import Chat from './components/Chat/Chat';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import backgroundImage from './assets/digital-banking-bg.jpg';
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isLoginFading, setIsLoginFading] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoginFading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
    }, 600); // Match the fadeOut animation duration
  };

  return (
    <div className="app" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backdropFilter: 'blur(10px)' }}>
      {!isLoggedIn && (
        <div className={`component-container ${isLoginFading ? 'fade-out' : ''}`}>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
      
      {isLoggedIn && (
        <div className="component-container fade-in">
          <div className="chat-container">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MuiThemeProvider theme={theme}>
                <StyledThemeProvider theme={theme}>
                  <CssBaseline />
                  <GlobalStyles />
                  <Router>
                    <CustomerProvider>
                      <ModuleProvider>
                        <Chat />
                      </ModuleProvider>
                    </CustomerProvider>
                  </Router>
                </StyledThemeProvider>
              </MuiThemeProvider>
            </LocalizationProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
