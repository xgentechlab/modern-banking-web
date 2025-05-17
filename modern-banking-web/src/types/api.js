/**
 * @typedef {Object} Module
 * @property {string} moduleCode
 * @property {string} moduleName
 */

/**
 * @typedef {Object} SubModule
 * @property {string} submoduleCode
 * @property {string} submoduleName
 * @property {string} endpoint
 * @property {string} requestFile
 */

/**
 * @typedef {Object} ValidationParameter
 * @property {string} name
 * @property {string} type
 * @property {string} description
 * @property {Object} validation
 */

/**
 * @typedef {Object} ValidationQuestion
 * @property {string} parameter
 * @property {string} question
 */

/**
 * @typedef {Object} Validation
 * @property {boolean} is_complete
 * @property {ValidationParameter[]} missing_parameters
 * @property {ValidationQuestion[]} questions
 */

/**
 * @typedef {Object} ProcessTextResponse
 * @property {Module} module
 * @property {SubModule} sub_module
 * @property {Object} entities
 * @property {string} raw_text
 * @property {string|null} error
 * @property {Validation} validation
 */

export const MODULES = {
  ACC: 'Accounts',
  TRANS: 'Transactions',
  CARDS: 'Cards',
  // Add other modules as needed
}; 