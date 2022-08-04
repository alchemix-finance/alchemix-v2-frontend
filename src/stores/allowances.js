import { writable } from 'svelte/store';

const defaults = {
  tokens: [],
};

const allowances = writable({
  ...defaults,
});

export const allowancesReset = () => {
  allowances.set({ ...defaults });
};

export default allowances;
