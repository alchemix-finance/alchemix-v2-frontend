import alcxStore, { BalanceType, BodyVaultType } from '@stores/v2/alcxStore';
import { produce } from 'immer';
import { ethers, providers } from 'ethers';
import { VaultTypes } from '@stores/v2/types';

export const updateAddress = (address: string) => {
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      _draftState.address = address;
    }),
  );
};

export const updateProvider = (provider: providers.Web3Provider) => {
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      _draftState.provider = provider;
    }),
  );
};

export const updateENS = (ensAddress: string) =>
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      _draftState.ens = ensAddress;
    }),
  );

export const updateAllBalances = (balances: BalanceType[]) =>
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      _draftState.balances = balances;
    }),
  );

export const updateOneBalance = (balanceAddress: string, balanceAmount: ethers.BigNumber) =>
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      const index = _draftState.balances.findIndex((bal) => bal.address === balanceAddress);
      if (index !== -1) _draftState.balances[index].balance = balanceAmount;
    }),
  );

export const updateAllTokens = (vault: VaultTypes, _yTokens: string[], _uyTokens: string[]) =>
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      _draftState.tokens[vault].yieldTokens = _yTokens;
      _draftState.tokens[vault].underlyingTokens = _uyTokens;
    }),
  );

export const updateVaultDebt = (vault: VaultTypes, debt: any) =>
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      _draftState.vaults[vault].debt = debt;
    }),
  );

export const updateVaultRatio = (vault: VaultTypes, ratio: ethers.BigNumber) =>
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      _draftState.vaults[vault].ratio = ratio;
    }),
  );

export const updateAllVaultBody = (vault: VaultTypes, vaultsBodies: BodyVaultType[]) =>
  alcxStore.update((_store) =>
    produce(_store, (_draftState) => {
      _draftState.vaults[vault].vaultBody = [...vaultsBodies];
    }),
  );
