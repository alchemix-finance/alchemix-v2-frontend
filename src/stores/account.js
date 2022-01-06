import { writable } from 'svelte/store';

const account = writable({
  loadingSupportedTokens: true,
  loadingWalletBalance: true,
  loadingVaultConfigurations: true,
  loadingTransmuterConfigurations: true,
  address: undefined,
  signer: undefined,
  ens: undefined,
  provider: undefined,
});

export default account;
