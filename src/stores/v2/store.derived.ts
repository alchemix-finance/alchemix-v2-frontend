import account from './store';
import { derived } from 'svelte/store';
import { makeDefaultValue, StoreState } from '@stores/v2/types';
import { getAsyncDerivator, getDerivator } from '@stores/v2/helpers';

export const ens = derived(
  [getDerivator(account.address), getDerivator(account.provider)],
  ([$address, $provider], _set) => {
    if (!$address && !$provider) {
      _set({ value: undefined, status: StoreState.LOADING });
    }

    $provider
      .lookupAddress($address)
      .then((ensAddress) => {})
      .catch((e) => {});

    return () => {
      _set({ value: undefined, status: StoreState.LOADING });
    };
  },
  makeDefaultValue(undefined),
);
