import { writable } from 'svelte/store';

const defaults = {
  amountYield: null,
  amountUnderlying: null,
  amountBorrow: null,
  amountRepay: null,
  method: null,
  yieldToken: null,
  underlyingToken: null,
  targetAddress: null,
  vaultIndex: null,
};

Object.freeze(defaults);

const tempTx = writable({
  ...defaults,
});

export const tempTxReset = () => {
  tempTx.set({ ...defaults });
};

export default tempTx;
export { defaults };
