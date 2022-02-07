import { derived, writable } from 'svelte/store';
import { providers } from 'ethers';
import type { Readable } from 'svelte/store';

const makeProviderStore = () => {
  const _provider = writable<providers.Web3Provider>(undefined);

  return {
    ..._provider,
    setProvider: (provider: providers.Web3Provider) => _provider.set(provider),
    clearProvider: () => _provider.set(undefined),
    signer: derived([_provider], ([$provider]) => {
      if ($provider) return $provider.getSigner();

      return undefined;
    }),
  };
};

const makeAccountStore = (provider: ReturnType<typeof makeProviderStore>) => {
  const _account = writable<string>('');

  return {
    subscribe: _account.subscribe,
    ens: derived([provider], ([$provider], _set) => {}),
  };
};

const defaults = {
  loadingSupportedTokens: true,
  loadingWalletBalance: true,
  loadingVaultConfigurations: true,
  loadingTransmuterConfigurations: true,
  loadingFarmsConfigurations: true,
  address: undefined,
  signer: undefined,
  ens: undefined,
  provider: undefined,
};

const account = writable({
  ...defaults,
});

export const accountReset = () => {
  account.set({ ...defaults });
  localStorage.removeItem('userWallet');
};

export default account;
