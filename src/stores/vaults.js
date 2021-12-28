import { writable } from 'svelte/store';

const vaults = writable({
  fetching: true,
  alusd: [],
  aleth: [],
  albtc: [],
});

export const aggregate = writable({
  deposited: [],
  totalDeposit: 0,
  totalDebt: 0,
});

export default vaults;
