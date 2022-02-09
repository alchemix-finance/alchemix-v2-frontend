import { derived, writable } from 'svelte/store';
import { AccountType } from '@stores/v2/account';
import { VaultConstants, VaultTypes } from '@stores/v2/constants';
import { contractWrapper } from '@helpers/contractWrapper';

import stakingPools, { poolLookup } from '@stores/stakingPools';
import { arrayDoubleCheck } from '@helpers/arrayHelpers';

export type TokenListType = {
  [key in VaultTypes]?: {
    yieldTokens: [];
    underlyingTokens: [];
  };
};

export const tokensList = writable<TokenListType>({});

export const fullTokenList = derived(
  [tokensList],
  ([$tokenList]) => {
    const _list = [...poolLookup.map((pool) => pool.address)];

    Object.keys($tokenList).forEach((vaultKey) => {
      Object.keys($tokenList[vaultKey]).forEach((tokenKey) => {
        $tokenList[vaultKey][tokenKey].forEach((address) => {
          if (arrayDoubleCheck(address, $tokenList[vaultKey][tokenKey])) {
            _list.push(address);
          }
        });
      });
    });

    return _list;
  },
  [],
);

export async function updateTokenListForVault(accountStore: AccountType, vaultId: VaultTypes) {
  const { instance } = contractWrapper(
    VaultConstants[vaultId].alchemistContractSelector,
    accountStore.provider.getSigner(),
  );

  const yieldTokens = await instance.getSupportedYieldTokens();
  const underlyingTokens = await instance.getSupportedUnderlyingTokens();

  tokensList.update((_prevState) => {
    const _state = _prevState;

    _state[vaultId].underlyingTokens = underlyingTokens;
    _state[vaultId].yieldTokens = yieldTokens;

    return _state;
  });
}
