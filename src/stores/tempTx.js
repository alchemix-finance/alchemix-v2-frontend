import { writable } from 'svelte/store';

const defaults = {
  amountYield: null,
  amountUnderlying: null,
  amountBorrow: null,
  amountRepay: null,
  amountAlToken: null,
  method: null,
  yieldToken: null,
  underlyingToken: null,
  alToken: null,
  targetAddress: null,
  vaultIndex: null,
  transmuter: null,
  transmuterAddress: null,
  alTokenAllowance: null,
  unexchangedBalance: null,
  maximumLoss: null,
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
