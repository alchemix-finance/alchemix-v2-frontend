import { derived, writable } from 'svelte/store';
import { providers } from 'ethers';
import { DefaultDerivedState, DerivedStatus } from '@helpers/storeHelpers';

export type AccountType = {
  address: string;
  provider: providers.Web3Provider;
};

export const accountStore = writable<AccountType>({
  address: undefined,
  provider: undefined,
});

export const signer = derived([accountStore], ([$acStore]) => $acStore.provider.getSigner());

export const ENS = derived(
  [accountStore],
  ([$acStore], _set) => {
    $acStore.provider
      .lookupAddress($acStore.address)
      .then((address) => {
        _set({ Value: address, Status: DerivedStatus.LOADED });
      })
      .catch((error) => {
        _set({ Value: undefined, Status: DerivedStatus.ERROR });
        console.error(`[ENS]: ${error}`);
      });

    return () => {
      _set({ Value: undefined, Status: DerivedStatus.LOADING });
    };
  },
  { ...DefaultDerivedState },
);
