import { writable } from 'svelte/store';

const tempTx = writable({
  amountYield: null,
  amountUnderlying: null,
  amountBorrow: null,
  amountRepay: null,
  method: null,
  yieldToken: null,
  underlyingToken: null,
  targetAddress: null,
});

export default tempTx;
