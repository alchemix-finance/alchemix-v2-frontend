import { writable } from 'svelte/store';

const account = writable({
  address: undefined,
  balance: undefined,
});

export default account;
