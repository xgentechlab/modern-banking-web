import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Autocomplete,
  FormHelperText
} from '@mui/material';
import { motion } from 'framer-motion';
import { GlassCard } from '../../theme/components';

const ParameterContainer = styled(motion(GlassCard))`
  padding: 1rem;
  margin: 1rem 0;
  width: 100%;
  max-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const EnhancedParameterResolver = ({
  parameter,
  onParameterResolved,
  validationRules = {},
  context = {},
  suggestions = [],
  loading = false
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) {
      validateValue(value);
    }
  }, [value, touched]);

  const validateValue = (val) => {
    if (validationRules.required && !val) {
      setError('This field is required');
      return false;
    }
    if (validationRules.pattern && !validationRules.pattern.test(val)) {
      setError(validationRules.errorMessage || 'Invalid format');
      return false;
    }
    if (validationRules.custom) {
      const customError = validationRules.custom(val, context);
      if (customError) {
        setError(customError);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    
    if (validateValue(value)) {
      onParameterResolved(value);
    }
  };

  const handleChange = (e, newValue) => {
    setValue(newValue?.value || newValue || e.target.value);
    if (touched) {
      validateValue(newValue?.value || newValue || e.target.value);
    }
  };

  const renderInput = () => {
    const commonProps = {
      value,
      onChange: handleChange,
      error: !!error,
      disabled: loading,
      fullWidth: true,
      size: "medium",
      onBlur: () => setTouched(true)
    };

    if (suggestions.length > 0) {
      return (
        <Autocomplete
          options={suggestions}
          getOptionLabel={(option) => option.label}
          onChange={handleChange}
          renderInput={(params) => (
            <TextField
              {...params}
              {...commonProps}
              label={parameter.description}
            />
          )}
        />
      );
    }

    return (
      <TextField
        {...commonProps}
        label={parameter.description}
        type={parameter.type === 'number' ? 'number' : 'text'}
      />
    );
  };

  return (
    <ParameterContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Form onSubmit={handleSubmit}>
        <Typography variant="subtitle1" color="primary">
          {parameter.question || 'Please provide the following information:'}
        </Typography>
        
        {renderInput()}
        
        {error && (
          <FormHelperText error>
            {error}
          </FormHelperText>
        )}

        <ButtonContainer>
          <Button
            variant="contained"
            type="submit"
            disabled={loading || (touched && !!error)}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </ButtonContainer>
      </Form>
    </ParameterContainer>
  );
};

export default EnhancedParameterResolver; 