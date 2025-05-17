import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  TextField, 
  Button, 
  Typography,
  FormControl,
  FormHelperText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { GlassCard, FlexBox } from '../../theme/components';

const FormContainer = styled(GlassCard)`
  padding: 1rem;
  margin-top: 1rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ParameterInfo = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const ClarificationForm = ({ 
  questions, 
  missingParameters, 
  onSubmit,
  onCancel 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all required fields are filled
    const newErrors = {};
    missingParameters.forEach(param => {
      if (!formData[param.name]) {
        newErrors[param.name] = 'This field is required';
      } else if (param.validation?.pattern) {
        const regex = new RegExp(param.validation.pattern);
        if (!regex.test(formData[param.name])) {
          newErrors[param.name] = `Invalid format. Expected format: ${param.validation.pattern}`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (paramName) => (e) => {
    setFormData(prev => ({
      ...prev,
      [paramName]: e.target.value
    }));
    
    // Clear error when user types
    if (errors[paramName]) {
      setErrors(prev => ({
        ...prev,
        [paramName]: null
      }));
    }
  };

  const getQuestionForParameter = (paramName) => {
    const question = questions.find(q => q.parameter === paramName);
    return question ? question.question : '';
  };

  return (
    <FormContainer>
      <Typography variant="h6" gutterBottom>
        Additional Information Needed
      </Typography>
      <StyledForm onSubmit={handleSubmit}>
        {missingParameters.map((param) => (
          <FormControl key={param.name} error={!!errors[param.name]}>
            <TextField
              label={getQuestionForParameter(param.name) || param.description}
              value={formData[param.name] || ''}
              onChange={handleChange(param.name)}
              error={!!errors[param.name]}
              helperText={errors[param.name]}
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: param.description && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="parameter info"
                      edge="end"
                      size="small"
                      onClick={(e) => e.preventDefault()}
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {param.description && (
              <ParameterInfo>
                {param.description}
              </ParameterInfo>
            )}
          </FormControl>
        ))}
        <FlexBox gap="1rem" justify="flex-end">
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit"
          >
            Submit
          </Button>
        </FlexBox>
      </StyledForm>
    </FormContainer>
  );
};

export default ClarificationForm; 