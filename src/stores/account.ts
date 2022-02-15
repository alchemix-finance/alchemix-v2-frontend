import { writable } from 'svelte/store';

const defaults = {
  loadingSupportedTokens: true,
  loadingWalletBalance: true,
  loadingVaultConfigurations: true,
  loadingTransmuterConfigurations: true,
  loadingFarmsConfigurations: true,
  address: undefined,
  signer: undefined,
  provider: undefined,
  ens: undefined,
};

const account = writable({
  ...defaults,
});

export const accountReset = () => {
  account.set({ ...defaults });
  localStorage.removeItem('userWallet');
};

export default account;
