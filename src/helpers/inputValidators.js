/**
 * @dev Use the function to check if an input is numeric
 * @param {string} value the input value
 * @returns {[any, string]} [0]: the input value, [1]: string error or undefined
 */
const numericValidator = (value) => {
  if (!Number.isNaN(value) && (parseInt(value, 10) > 0 || parseFloat(value) > 0)) {
    return [value, undefined];
  }

  return [undefined, '!VALUE'];
};

export { numericValidator };
