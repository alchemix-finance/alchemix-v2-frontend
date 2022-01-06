import { writable } from 'svelte/store';

const vaults = writable({
  fetching: true,
  alusd: [],
  aleth: [],
  albtc: [],
});

export const alusd = writable({
  userDebt: 0,
  maxDebt: 0,
  ratio: undefined,
  yieldTokens: [],
  loadingRowData: true,
  rows: [],
});

export const aleth = writable({
  uerDebt: 0,
  maxDebt: 0,
  ratio: undefined,
  yieldTokens: [],
  rows: [],
});

export const aggregate = writable({
  deposited: [],
  totalDeposit: 0,
  totalDebt: 0,
});

export default vaults;
