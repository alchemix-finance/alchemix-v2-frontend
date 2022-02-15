import { BalanceType, BodyVaultType } from '@stores/v2/alcxStore';
import { ethers, providers } from 'ethers';
import { VaultTypes } from '@stores/v2/types';
import { addressStore, providerStore, balancesStore, vaultsStore, tokensStore } from './alcxStore';

export const updateAddress = (address: string) => {
  addressStore.set(address);
};

export const updateProvider = (provider: providers.Web3Provider) => {
  providerStore.set(provider);
};

export const updateAllBalances = (balances: BalanceType[]) => balancesStore.set(balances);

export const updateOneBalance = (balanceAddress: string, balanceAmount: ethers.BigNumber) =>
  balancesStore.update((_prevStore) => {
    console.log(_prevStore);
    const index = _prevStore.findIndex((bal) => bal.address === balanceAddress);
    if (index !== -1) {
      _prevStore[index].balance = balanceAmount;
    }

    return _prevStore;
  });

export const updateAllTokens = (vault: VaultTypes, _yTokens: string[], _uyTokens: string[]) => {
  tokensStore.update((_prevStore) => ({
    ..._prevStore,
    [vault]: {
      yieldTokens: _yTokens,
      underlyingTokens: _uyTokens,
    },
  }));
};

export const updateVaultDebt = (vault: VaultTypes, debt: any) =>
  vaultsStore.update((_store) => {
    _store = {
      ..._store,
      [vault]: {
        ..._store[vault],
        debt: debt,
      },
    };

    return _store;
  });

export const updateVaultRatio = (vault: VaultTypes, ratio: ethers.BigNumber) =>
  vaultsStore.update((_store) => {
    _store = {
      ..._store,
      [vault]: {
        ..._store[vault],
        ratio: ratio,
      },
    };

    return _store;
  });

export const updateAllVaultBody = (vault: VaultTypes, vaultsBodies: BodyVaultType[]) =>
  vaultsStore.update((_store) => {
    _store = {
      ..._store,
      [vault]: {
        ..._store[vault],
        vaultBody: [...vaultsBodies],
      },
    };
    return _store;
  });

export const updateVaultByIndex = (vault: VaultTypes, vaultIndex: number, vaultBody: BodyVaultType) =>
  vaultsStore.update((_store) => {
    _store[vault].vaultBody[vaultIndex] = vaultBody;

    return _store;
  });

export const updateVaultByAddress = (vault: VaultTypes, vaultAddress: string, vaultBody: BodyVaultType) =>
  vaultsStore.update((_store) => {
    const index = _store[vault].vaultBody.findIndex((vault) => vault.address === vaultAddress);
    if (index !== -1) {
      _store[vault].vaultBody[index] = vaultBody;
    }

    return _store;
  });
