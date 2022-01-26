const inputErrorModifier = (value, error) => {
  if (error === 'ERROR') {
    return 'outline-none rounded-sm border-2 border-red1 border-opacity-90';
  }

  return '';
};

export { inputErrorModifier };
