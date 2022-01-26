// value > 0
const integerFilter = (value) => /^\d*$/.test(value);
const floatFilter = (value) => /^\d*[.,]?\d*$/.test(value);

// Export filters
export { integerFilter, floatFilter };
