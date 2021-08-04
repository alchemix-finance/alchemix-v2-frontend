import { writable } from 'svelte/store';

const account = writable({
  address: undefined,
  signer: undefined,
});

export default account;
