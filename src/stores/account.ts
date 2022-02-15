import { derived, writable } from 'svelte/store';
import { DefaultDerivedState, DerivedStatus } from '@helpers/storeHelpers';

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
