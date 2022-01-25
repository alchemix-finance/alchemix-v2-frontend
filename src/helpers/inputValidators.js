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
  return [undefined, '!VALUE'];
};

export { numericValidator };
