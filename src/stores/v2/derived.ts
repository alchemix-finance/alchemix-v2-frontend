import { arrayDoubleCheck } from 'src/helpers/arrayHelpers';
import { derived } from 'svelte/store';
import { providerStore, tokensStore } from './alcxStore';
import { poolLookup } from '@stores/stakingPools';

export const signer = derived([providerStore], ([$provider]) => $provider?.getSigner());

export const fullTokenList = derived([tokensStore], ([$tokensStore]) => {
  if (!$tokensStore) {
    return [];
  }

  const _list = [...poolLookup.map((pool) => pool.address)];

  Object.keys($tokensStore).forEach((vaultKey) => {
    Object.keys($tokensStore[vaultKey]).forEach((tokenKey) => {
      $tokensStore[vaultKey][tokenKey].forEach((address) => {
        if (arrayDoubleCheck(address, $tokensStore[vaultKey][tokenKey])) {
          _list.push(address);
        }
      });
    });
  });

  return _list;
});
