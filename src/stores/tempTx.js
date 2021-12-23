import { writable } from 'svelte/store';

const tempTx = writable({
  amount: null,
  method: null,
  yieldToken: null,
  underlyingToken: null,
});

export default tempTx;
