import { derived, writable } from 'svelte/store';
import { providers } from 'ethers';
import { DefaultDerivedState, DerivedStatus } from '@helpers/storeHelpers';

export const makeProviderStore = () => {
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

export const makeAccountStore = (provider: ReturnType<typeof makeProviderStore>) => {
  const _account = writable<string>('');

  return {
    ..._account,
    setAccount: (account) => {
      _account.set(account);
    },
    ens: derived(
      [provider, _account],
      ([$provider, $account], _set) => {
        if (!$provider || !$account) {
          _set({ Value: undefined, Status: DerivedStatus.LOADING });
        }

        $provider
          .lookupAddress($account)
          .then((ensAddress) => {
            _set({ Value: ensAddress, Status: DerivedStatus.LOADED });
          })
          .catch((error) => {
            console.error(`[makeAccountStore/ens]: ${error}`);
            _set({ Value: undefined, Status: DerivedStatus.ERROR });
          });
      },
      { ...DefaultDerivedState },
    ),
  };
};

export const provider = makeProviderStore();
export const account = makeAccountStore(provider);
