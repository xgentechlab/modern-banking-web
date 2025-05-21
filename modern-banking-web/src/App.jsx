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
import BackgroundVideo from './assets/empowering-banks-video-11.mp4';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginFading, setIsLoginFading] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoginFading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
    }, 600); // Match the fadeOut animation duration
  };

  return (
    <div className="app">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        style={{
          position: 'fixed',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // zIndex: -1,
          // border: '1px solid red',
        }}
      >
        <source src={BackgroundVideo} type="video/mp4" />
        {/* Fallback to background image if video doesn't load */}
        Your browser does not support the video tag.
      </video>
      
      {/* Optional overlay to darken or adjust video brightness */}
      <div
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
           // backgroundColor: 'rgba(0, 0, 0, 0.3)', // Adjust opacity as needed
          // backdropFilter: 'blur(5px)', // Optional blur effect
          zIndex: -1,
        }}
      />

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
