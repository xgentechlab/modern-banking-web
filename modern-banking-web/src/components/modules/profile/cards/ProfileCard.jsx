import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';
import { useCustomer } from '../../../../context/CustomerContext';

const ProfileContainer = styled(GlassCard)`
  width: 100%;
  margin: 16px;
  min-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
`;

const InfoSection = styled.div`
  margin: 16px 0;
  
  display: flex;
  align-items: center;
`;

// Mock API functions


const ProfileCard = ({ customerId, showAddressForm = false, showMobileForm = false, showEmailForm = false , nlpResponse }) => {
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    mobile: "",
    email: ""
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpDialog, setOtpDialog] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  let {customer} = useCustomer();

  const fetchProfileDetails = async ({ customerId }) => {

    let address = customer?.profile?.address?.street + ' ' + customer?.profile?.address?.city + ' ' + customer?.profile?.address?.state + ' ' + customer?.profile?.address?.zipCode + ' ' + customer?.profile?.address?.country ;
     
     return {
       address: address,
       mobile: customer?.profile?.phone,
       email: customer?.profile?.email,
       lastUpdated: new Date()
     };
   };

  const { data: profileDetails, isLoading } = useQuery({
    queryKey: ['profile', customerId],
    queryFn: () => fetchProfileDetails({ customerId }),
    staleTime: 30000
  });

  

  const handleEdit = (field) => {
    setEditMode(field);
    setFormData(prev => ({
      ...prev,
      [field]: profileDetails[field]
    }));
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(null);
  };

  const handleOtpChange = (index, value) => {
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

  const validateField = (field, value) => {
    switch (field) {
      case 'mobile':
        return /^\+?[\d\s-]{10,}$/.test(value) 
          ? null 
          : 'Please enter a valid mobile number';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : 'Please enter a valid email address';
      case 'address':
        return value.length >= 5
          ? null
          : 'Address must be at least 5 characters long';
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (editMode === 'address') {
      // Update address
      // Mock API call
      console.log('Updating address:', formData.address);
    } else if (editMode === 'mobile') {
      // Update mobile
      // Mock API call
      console.log('Updating mobile:', formData.mobile);
    } else if (editMode === 'email') {
      // Update email
      // Mock API call
      console.log('Updating email:', formData.email);
    }
    
    setLoading(false);
    setEditMode(null);
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid OTP');
      return;
    }
    // Mock successful update
    setOtpDialog(false);
    setEditMode(null);
    setOtp(['', '', '', '', '', '']);
  };

  if (isLoading) {
    return (
      <ProfileContainer>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </ProfileContainer>
    );
  }

  const renderField = (field, icon, label) => {

    const { entities} = nlpResponse;
    return (
    <InfoSection>
      
      <Box flex={1} justify="space-between" align="center">
        {editMode === field || entities[field] ? (
          <Form onSubmit={handleSubmit} style={{ display: 'flex' , flexDirection: 'column' , justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px'}}>
          <FlexBox justify="space-between" align="center" gap="1rem">
            <CircleIcon>
        {icon}
      </CircleIcon>
            <TextField
              
              value={entities[field] || formData[field]}
              onChange={handleChange(field)}
              error={!!error}
              helperText={error}
              label={label}
            />
            </FlexBox>
            <ButtonContainer>
              <Button
                variant="outlined"
                onClick={() => setEditMode(null)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
              >
                Save Changes
              </Button>
            </ButtonContainer>
          </Form>
        ) : (
          <FlexBox justify="space-between" align="center">
            <FlexBox justify="space-between" align="center" gap="1rem">
             <CircleIcon>
        {icon}
      </CircleIcon>
            <div style={{ display: 'flex' , flexDirection: 'column' , justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px'}} >
              <Typography variant="body2" color="textSecondary" >
                {label}
              </Typography>
              <Typography variant="h6" color="textPrimary" >
                {profileDetails[field]}
              </Typography>
            </div>
            </FlexBox>
            <Button
              startIcon={<EditIcon />}
              onClick={() => handleEdit(field)}
            >
              Edit
            </Button>
          </FlexBox>
        )}
      </Box>
        </InfoSection>
  )};

  return (
    <ProfileContainer>
      <CardContent>
        <FlexBox gap="1rem" mb={3}>
          <CircleIcon size="48px">
            <PersonIcon fontSize="large" />
          </CircleIcon>
          <div>
            <Typography variant="h5">Profile Settings</Typography>
            <Typography variant="body2" color="textSecondary">
              Last updated: {new Date(profileDetails.lastUpdated).toLocaleString()}
            </Typography>
          </div>
        </FlexBox>

        { showAddressForm && renderField('address', <HomeIcon />, 'Address')}
        { showMobileForm && renderField('mobile', <PhoneIcon />, 'Mobile Number')}
        { showEmailForm && renderField('email', <EmailIcon />, 'Email Address')}

        {/* OTP Dialog */}
        <Dialog open={otpDialog} onClose={() => setOtpDialog(false)}>
          <DialogTitle>Verify OTP</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Please enter the OTP sent to your registered mobile number
            </Typography>
            <Box display="flex" justifyContent="center" gap={1} mt={2}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  inputProps={{ maxLength: 1 }}
                />
              ))}
            </Box>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOtpDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleVerifyOtp}>
              Verify & Update
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </ProfileContainer>
  );
};

export default ProfileCard; 