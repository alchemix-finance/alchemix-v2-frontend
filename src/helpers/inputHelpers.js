// value > 0
const integerFilter = (value) => /^\d*$/.test(value);
const floatFilter = (value) => /^\d*[.]?\d*$/.test(value) && value.length < 17;

// Export filters
export { integerFilter, floatFilter };
