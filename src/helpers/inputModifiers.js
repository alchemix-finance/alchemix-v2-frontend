const inputErrorModifier = (value, error) => {
  if (error === 'ERROR') {
    return 'border border-red1 border-opacity-90';
  }

  return '';
};

export { inputErrorModifier };
