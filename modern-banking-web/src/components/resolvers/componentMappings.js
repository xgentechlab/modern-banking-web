// Action Types
import { RESOLUTION_RULES } from '../../utils/resolutionRules';


// Helper function to validate entities
const validateEntities = (entities, moduleCode, customer) => {
  if (!entities) return { isValid: true };

  switch (moduleCode) {
    case 'ACC':
      // Validate account numbers
      if (entities.accountNumber) {
        const accountExists = customer?.accounts?.some(
          acc => acc.id == entities.accountNumber || acc.number == entities.accountNumber
        );
        if (!accountExists) {
          return {
            isValid: false,
            error: `Account number ${entities.accountNumber} does not exist in your accounts.`,
            suggestion: 'Please check the account number and try again. You can view all your accounts by asking for "show my accounts".'
          };
        }
      }
      break;
    // Add other module validations here
  }

  return { isValid: true };
};

// Helper function to determine resolution strategy
export const resolveComponent = (nlpResponse, customer) => {
  // Handle invalid or missing module code
  if (!nlpResponse?.moduleCode || nlpResponse.error) {
    return {
      component: 'ErrorMessage',
      config: {
        message: 'Something went wrong, Please try again',
        suggestion: 'You can try rephrasing your request or contact support if the issue persists.',
        showRetry: true
      }
    };
  }

  // const module = MODULES[nlpResponse.module.moduleCode];
  // const subModule = module?.subModules[nlpResponse.sub_module?.submoduleCode];
  const { moduleCode, submoduleCode,  entities } = nlpResponse;

  // Handle invalid submodule
  if (!moduleCode || !submoduleCode) {
    return {
      component: 'ErrorMessage',
      config: {
        message: 'Something went wrong, Please try again',
        suggestion: 'You can try rephrasing your request or contact support if the issue persists.',
        showRetry: true
      }
    };
  }

  const subModuleConfig = RESOLUTION_RULES[moduleCode]?.[submoduleCode];
  
  // Handle missing resolution rules
  if (!subModuleConfig) {
    return {
      component: 'ErrorMessage',
      config: {
        message: 'Something went wrong, Please try again',
        suggestion: 'You can try rephrasing your request or contact support if the issue persists.',
        showRetry: true
      }
    };
  }

  // Validate entities first
  // const validationResult = validateEntities(entities, module.moduleCode, customer);
  // if (!validationResult.isValid) {
  //   return {
  //     component: 'ErrorMessage',
  //     config: {
  //       message: validationResult.error,
  //       suggestion: validationResult.suggestion,
  //       showRetry: true
  //     }
  //   };
  // }

  // For account-related queries, always show grid first
  // if (module.moduleCode === 'ACC') {
  //   return subModuleConfig.resolutionStrategy.default;
  // }

  // For other modules, follow normal resolution flow
  // if (validation.is_complete) {
  //   return subModuleConfig.resolutionStrategy.complete || subModuleConfig.resolutionStrategy.default;
  // }

  // Check for specific missing parameters
  // const missingParam = validation.missing_parameters[0]?.name;
  // if (missingParam && subModuleConfig.resolutionStrategy[`missing${missingParam.charAt(0).toUpperCase() + missingParam.slice(1)}`]) {
  //   return subModuleConfig.resolutionStrategy[`missing${missingParam.charAt(0).toUpperCase() + missingParam.slice(1)}`];
  // }

  // Fallback to default strategy
  return subModuleConfig.resolutionStrategy.default;
}; 