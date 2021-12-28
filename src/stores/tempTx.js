import { writable } from 'svelte/store';

const tempTx = writable({
  amountYield: null,
  amountUnderlying: null,
  method: null,
  yieldToken: null,
  underlyingToken: null,
});

export default tempTx;
