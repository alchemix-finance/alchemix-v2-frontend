const inputNumberLimiter = () => `javascript: return event.keyCode === 8 ||
event.keyCode === 46 ? true : !isNaN(Number(event.key))`;

export { inputNumberLimiter };
