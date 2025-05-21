import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  TextField, 
  Button, 
  MenuItem,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const BeneficiaryCard = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    background: ${props => props.theme.palette.background.paper};
    transition: ${props => props.theme.transitions.quick};

    &:hover {
      background: ${props => props.theme.palette.grey[50]};
    }

    &.Mui-focused {
      background: ${props => props.theme.palette.grey[50]};
    }
  }
`;

const StyledStepper = styled(Stepper)`
  margin: 2rem 0;
`;

const OTPContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 2rem 0;
`;

const OTPInput = styled(StyledTextField)`
  width: 4rem;
  
  .MuiOutlinedInput-input {
    text-align: center;
    font-size: 1.5rem;
    padding: 0.5rem;
  }
`;

const AddBeneficiaryCard = ({
  banksList = [],
  accountTypes = [],
  onSubmit,
  onVerify = () => {},
  loading = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    bankName: '',
    accountType: '',
    email: '',
    phone: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const steps = ['Beneficiary Details', 'Verify OTP'];

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleOtpChange = (index) => (event) => {
    const value = event.target.value;
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep === 0) {
      // const success = await onSubmit(formData);
      
        setActiveStep(1);
      
    } else {
      const otpValue = otp.join('');
      onVerify(otpValue);
    }
  };

  const isFormValid = () => {
    if (activeStep === 0) {
      return formData.name && 
             formData.accountNumber && 
             formData.bankName &&
             formData.accountType &&
             formData.email &&
             formData.phone;
    }
    return otp.every(digit => digit !== '');
  };

  return (
    <BeneficiaryCard>
      <FlexBox gap="1rem">
        <CircleIcon>
          <PersonAddIcon />
        </CircleIcon>
        <div style={{textAlign: 'left'}}>
          <Typography variant="h6">Add New Beneficiary</Typography>
          <Typography variant="body2" color="text.secondary">
            Add and verify a new beneficiary for quick transfers
          </Typography>
        </div>
      </FlexBox>

      <StyledStepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </StyledStepper>

      <Form onSubmit={handleSubmit}>
        {activeStep === 0 ? (
          <>
            <StyledTextField
              label="Beneficiary Name"
              value={formData.name}
              onChange={handleChange('name')}
              fullWidth
              required
            />

            <StyledTextField
              label="Account Number"
              value={formData.accountNumber}
              onChange={handleChange('accountNumber')}
              fullWidth
              required
            />

            <StyledTextField
              select
              label="Bank Name"
              value={formData.bankName}
              onChange={handleChange('bankName')}
              fullWidth
              required
            >
              {banksList.map((bank) => (
                <MenuItem key={bank.id} value={bank.id}>
                  {bank.name}
                </MenuItem>
              ))}
            </StyledTextField>

            <StyledTextField
              select
              label="Account Type"
              value={formData.accountType}
              onChange={handleChange('accountType')}
              fullWidth
              required
            >
              {accountTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </StyledTextField>

            <StyledTextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              fullWidth
              required
            />

            <StyledTextField
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange('phone')}
              fullWidth
              required
            />
          </>
        ) : (
          <div>
            <Typography align="center" gutterBottom>
              Enter the 6-digit OTP sent to your registered mobile number
            </Typography>
            <OTPContainer>
              {otp.map((digit, index) => (
                <OTPInput
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={handleOtpChange(index)}
                  inputProps={{
                    maxLength: 1,
                    type: 'tel'
                  }}
                />
              ))}
            </OTPContainer>
          </div>
        )}

        <Button
          variant="contained"
          type="submit"
          disabled={!isFormValid() || loading}
          fullWidth
          size="large"
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            activeStep === 0 ? 'Continue' : 'Verify & Add'
          )}
        </Button>
      </Form>
    </BeneficiaryCard>
  );
};

export default AddBeneficiaryCard; 