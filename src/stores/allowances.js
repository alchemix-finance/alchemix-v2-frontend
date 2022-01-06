import { writable } from 'svelte/store';

const allowances = writable({
  tokens: [],
});

export default allowances;
