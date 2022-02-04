import { writable } from 'svelte/store';

const defaults = {
  vaults: {
    fetching: true,
  },
  vaultConfig: {
    userDebt: 0,
    maxDebt: 0,
    ratio: undefined,
    debtToken: {},
    yieldTokens: [],
    loadingRowData: true,
    rows: [],
  },
  aggregate: {
    deposited: [],
    totalDeposit: 0,
    totalDebt: 0,
    debtLimit: 0,
    balance: 0,
  },
};

const vaults = writable({
  ...defaults.vaults,
});

export const alusd = writable({
  ...defaults.vaultConfig,
});

export const aleth = writable({
  ...defaults.vaultConfig,
});

export const aggregate = writable({
  ...defaults.aggregate,
});

export const vaultsReset = () => {
  vaults.set({ ...defaults.vaults });
  alusd.set({ ...defaults.vaultConfig });
  aleth.set({ ...defaults.vaultConfig });
  aggregate.set({ ...defaults.aggregate });
};

export default vaults;
