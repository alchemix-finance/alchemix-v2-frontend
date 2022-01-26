const inputErrorModifier = (value, error) => {
  if (error === 'ERROR') {
    return 'outline-none rounded-sm border-2 border-red1 border-opacity-90';
  }

  return '';
};

const isNumberRegEx = new RegExp(/^\d+\.?\d*$/);

/**
 * @dev Use the function to check if an input is numeric
 * @param {string} value the input value
 * @returns {[any, string]} [0]: the input value, [1]: string error or undefined
 */
const numericValidator = (value) => {
  // Returns an empty value and not an error if the input is empty
  if (value === '') {
    return [undefined, undefined];
  }

  // Return the value just if the conditions are meet
  if (isNumberRegEx.test(value)) {
    return [value, undefined];
  }

  // Returns an error if the conditions are not meet
  return [undefined, 'ERROR'];
};

// value > 0
const integerFilter = (value) => /^\d*$/.test(value);
const floatFilter = (value) => /^\d*[.,]?\d*$/.test(value);

// Export validators
export { numericValidator };
// Export modifiers
export { inputErrorModifier };
// Export filters
export { integerFilter, floatFilter };
