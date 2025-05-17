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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  SupportAgent as SupportIcon,
  Report as ReportIcon,
  MonetizationOn as MoneyIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const ServiceContainer = styled(GlassCard)`
  width: 100%;
  margin: 16px;
  min-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const StyledTableRow = styled(TableRow)`
  &:nth-of-type(odd) {
    background-color: ${props => props.theme.palette.action.hover};
  }
`;

const StatusChip = styled(Chip)`
  background: ${props => {
    switch (props.status) {
      case 'resolved':
        return props.theme.palette.success.light + '20';
      case 'pending':
        return props.theme.palette.warning.light + '20';
      case 'new':
        return props.theme.palette.info.light + '20';
      default:
        return props.theme.palette.grey[200];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'resolved':
        return props.theme.palette.success.main;
      case 'pending':
        return props.theme.palette.warning.main;
      case 'new':
        return props.theme.palette.info.main;
      default:
        return props.theme.palette.grey[700];
    }
  }};
`;

// Mock API functions
const fetchComplaints = async ({ customerId }) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: 'COMP001',
      type: 'Auto-debit Issue',
      description: 'Monthly auto-debit failed for utility bill',
      status: 'resolved',
      createdAt: new Date(Date.now() - 86400000 * 5),
      resolvedAt: new Date()
    },
    {
      id: 'COMP002',
      type: 'Interest Rate Query',
      description: 'Need clarification on new interest rates',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000 * 2)
    }
  ];
};

const ServiceQualityCard = ({ customerId }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    priority: 'medium'
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', customerId],
    queryFn: () => fetchComplaints({ customerId }),
    staleTime: 30000
  });

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    setActiveStep(1);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      type: '',
      description: '',
      priority: 'medium'
    });
  };

  const steps = ['Submit Complaint', 'Review', 'Confirmation'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Form onSubmit={handleSubmit}>
            <FormControl fullWidth required>
              <InputLabel>Complaint Type</InputLabel>
              <Select
                value={formData.type}
                label="Complaint Type"
                onChange={handleChange('type')}
              >
                <MenuItem value="auto-debit">Auto-debit Issue</MenuItem>
                <MenuItem value="interest">Interest Rate Query</MenuItem>
                <MenuItem value="charges">Bank Charges</MenuItem>
                <MenuItem value="service">Service Quality</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={handleChange('priority')}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange('description')}
              required
              fullWidth
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
            >
              Submit
            </Button>
          </Form>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Complaint
            </Typography>
            <Typography variant="body1" gutterBottom>
              Type: {formData.type}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Priority: {formData.priority}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Description: {formData.description}
            </Typography>
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ mt: 2 }}
            >
              Confirm & Submit
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Complaint Submitted Successfully
            </Typography>
            <Typography variant="body1" gutterBottom>
              Your complaint has been registered with ID: COMP003
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              We will get back to you within 24-48 hours.
            </Typography>
            <Button
              variant="contained"
              onClick={handleReset}
              sx={{ mt: 2 }}
            >
              Submit Another Complaint
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <ServiceContainer>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </ServiceContainer>
    );
  }

  return (
    <ServiceContainer>
      <CardContent>
        <FlexBox gap="1rem" mb={3}>
          <CircleIcon size="48px">
            <SupportIcon fontSize="large" />
          </CircleIcon>
          <div>
            <Typography variant="h5">Service Quality</Typography>
            <Typography variant="body2" color="textSecondary">
              Submit and track your complaints
            </Typography>
          </div>
        </FlexBox>

        {/* New Complaint Section */}
        <Box mb={4}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
        </Box>

        {/* Previous Complaints Section */}
        <Typography variant="h6" gutterBottom>
          Previous Complaints
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.map((complaint) => (
                <StyledTableRow key={complaint.id}>
                  <TableCell>{complaint.id}</TableCell>
                  <TableCell>{complaint.type}</TableCell>
                  <TableCell>{complaint.description}</TableCell>
                  <TableCell>
                    <StatusChip
                      label={complaint.status}
                      status={complaint.status}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </ServiceContainer>
  );
};

export default ServiceQualityCard; 