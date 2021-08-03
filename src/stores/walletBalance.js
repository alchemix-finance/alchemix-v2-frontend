import { writable } from 'svelte/store';

const walletBalance = writable({
  tokens: [],
});

export default walletBalance;
