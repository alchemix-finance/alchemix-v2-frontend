import { writable } from 'svelte/store';

const account = writable({
  address: undefined,
  signer: undefined,
  ens: undefined,
});

export default account;
