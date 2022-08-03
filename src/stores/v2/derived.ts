import { derived } from 'svelte/store';
import { BigNumber } from 'ethers';

import { arrayDoubleCheck } from '@helpers/arrayHelpers';
import { balancesStore, providerStore, tokensStore, vaultsStore, networkStore } from './alcxStore';
import { poolLookup, additionalTokens } from '@stores/stakingPools';
import { calculateVaultDebt, getTokenDataFromBalances, normalizeAmount } from './helpers';

export const signer = derived([providerStore], ([$provider]) => $provider?.getSigner());

export const fullTokenList = derived([tokensStore, networkStore], ([$tokensStore, $network]) => {
  if (!$tokensStore) {
    return [];
  }

  const _list = [
    ...poolLookup.filter((pool) => pool.network === $network).map((pool) => pool.address),
    ...additionalTokens.filter((token) => token.network === $network).map((token) => token.address),
  ];

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

export const vaultsAggregatedBalances = derived([vaultsStore, balancesStore], ([$vaults, $balances]) => {
  if (!$vaults) {
    return undefined;
  }

  let balances = {};

  Object.keys($vaults).forEach((vaultTypeKey) => {
    const { vaultBody } = $vaults[Number(vaultTypeKey)];

    let initialVal = BigNumber.from(0);

    balances = {
      ...balances,
      [Number(vaultTypeKey)]: vaultBody.reduce((_prevVault, _currentVault) => {
        const underlyingTokenData = getTokenDataFromBalances(_currentVault.underlyingAddress, [$balances]);
        const normalizedAmount = normalizeAmount(_currentVault.balance, underlyingTokenData.decimals, 18);

        return _prevVault.add(normalizedAmount);
      }, initialVal),
    };
  });

  return balances;
});

// @dev turns shares of each token into a value that's comparable to debt tokens
export const vaultsAggregatedCoveredDebt = derived([vaultsStore, balancesStore], ([$vaults, $balances]) => {
  if (!$vaults) {
    return undefined;
  }

  let balances = {};

  Object.keys($vaults).forEach((vaultTypeKey) => {
    const { vaultBody } = $vaults[Number(vaultTypeKey)];
    let initialVal = BigNumber.from(0);
    balances = {
      ...balances,
      [Number(vaultTypeKey)]: vaultBody.reduce((_prevVault, _currentVault) => {
        const underlyingTokenData = getTokenDataFromBalances(_currentVault.underlyingAddress, [$balances]);
        const normalizedAmount = _currentVault.balance
          .mul(_currentVault.underlyingPerShare)
          .div(BigNumber.from(10).pow(underlyingTokenData.decimals))
          .mul(BigNumber.from(10).pow(BigNumber.from(18).sub(underlyingTokenData.decimals)));

        return _prevVault.add(normalizedAmount);
      }, initialVal),
    };
  });
  return balances;
});

export const vaultsAggregatedDebt = derived([vaultsStore, balancesStore], ([$vaults, $balances]) => {
  if (!$vaults) {
    return undefined;
  }

  let debts = {};

  Object.keys($vaults).forEach((vaultTypeKey) => {
    const { vaultBody, ratio } = $vaults[Number(vaultTypeKey)];

    let initialVal = BigNumber.from(0);

    debts = {
      ...debts,
      [Number(vaultTypeKey)]: vaultBody.reduce((_prevVal, _currentVault) => {
        const underlyingTokenData = getTokenDataFromBalances(_currentVault.underlyingAddress, [$balances]);
        const debt = calculateVaultDebt(
          _currentVault.balance,
          _currentVault.underlyingPerShare,
          underlyingTokenData.decimals,
          ratio,
        );

        return _prevVal.add(debt);
      }, initialVal),
    };
  });

  return debts;
});
