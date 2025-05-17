import AccountSelector from '../components/ParameterInputs/AccountSelector';
import CardSelector from '../components/ParameterInputs/CardSelector';

// Map parameter types to their respective components
export const PARAMETER_COMPONENTS = {
  'account_id': {
    component: AccountSelector,
    dataKey: 'accounts', // Key in customer data where the options are stored
    valueKey: 'id', // Property to use as the selected value
  },
  'accountNumber': {
    component: AccountSelector,
    dataKey: 'accounts',
    valueKey: 'number',
  },
  'card_id': {
    component: CardSelector,
    dataKey: 'cards',
    valueKey: 'id',
  },
  // Add more mappings as needed
};

// Function to get the appropriate component for a parameter
export const getParameterComponent = (parameter) => {
  return PARAMETER_COMPONENTS[parameter.name] || null;
};

// Function to get the data for a parameter from customer data
export const getParameterData = (parameterName, customerData) => {
  const mapping = PARAMETER_COMPONENTS[parameterName];
  if (!mapping || !customerData) return null;
  
  return { [mapping.dataKey]: customerData[mapping.dataKey] || [], valueKey: mapping.valueKey };
};

// Function to format the selected value according to the parameter type
export const formatParameterValue = (parameterName, value) => {
  const mapping = PARAMETER_COMPONENTS[parameterName];
  if (!mapping) return value;

  return {
    value,
    type: parameterName,
  };
}; 