import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import backgroundImage from '../../assets/digital-banking-bg.jpg';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

const LoginContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // background: url(${backgroundImage}) no-repeat center center;
  background-size: cover;
  padding: 20px;
  animation: ${fadeIn} 0.6s ease-out;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // background: rgba(0, 0, 0, 0.7);
    
  }
  &.fade-out {
    animation: ${fadeOut} 0.6s ease-in forwards;
  }

 @media (max-width: 600px) {
    width: 100%
    padding: 0;
  }
`;

const GlassBox = styled(Box)`
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  @media (max-width: 600px) {
    width: 90%;
    padding: 20px;
  }
`;

const StyledTextField = styled(TextField)`
  && {
    margin-bottom: 20px;
    
    .MuiInputBase-root {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      
      &.Mui-focused {
        background: rgba(255, 255, 255, 0.15);
      }
    }
    
    .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.4);
    }
    
    .Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.6);
    }
    
    .MuiInputLabel-root {
      color: rgba(255, 255, 255, 0.7);
      
      &.Mui-focused {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
`;

const LoadingButton = styled(Button)`
  && {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
    text-transform: none;
    transition: all 0.3s ease;
    margin-top: 10px;

    &:hover {
      background: white;
      transform: translateY(-2px);
    }

    &.Mui-disabled {
      background: rgba(255, 255, 255, 0.7);
      color: rgba(44, 62, 80, 0.7);
    }
  }
`;

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  return (
    <LoginContainer>
      <Container maxWidth="sm">
        <GlassBox>
          <Typography variant="h4" component="h2" 
            sx={{ 
              color: 'white', 
              textAlign: 'center', 
              mb: 1,
              fontWeight: 600 
            }}>
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              textAlign: 'center', 
              mb: 4 
            }}>
            Please login to continue
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
            />
            
            <StyledTextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
            />

            <LoadingButton
              type="submit"
              disabled={isLoading}
              variant="contained"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </LoadingButton>
          </Box>
        </GlassBox>
      </Container>
    </LoginContainer>
  );
};

export default Login; 