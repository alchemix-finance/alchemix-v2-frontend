import { arrayDoubleCheck } from 'src/helpers/arrayHelpers';
import { derived } from 'svelte/store';
import { providerStore, tokensStore, vaultsStore } from './alcxStore';
import { poolLookup } from '@stores/stakingPools';
import { BigNumber } from 'ethers';

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

export const vaultsAggregatedBalances = derived([vaultsStore], ([$vaults]) => {
  if (!$vaults) {
    return undefined;
  }

  let balances = {};

  Object.keys($vaults).forEach((vaultTypeKey) => {
    const { vaultBody } = $vaults[Number(vaultTypeKey)];

    let initialVal = BigNumber.from(0);

    balances = {
      ...balances,
      [Number(vaultTypeKey)]: vaultBody.reduce(
        (_prevVault, _currentVault) => _prevVault.add(_currentVault.balance),
        initialVal,
      ),
    };
  });

  return balances;
});
