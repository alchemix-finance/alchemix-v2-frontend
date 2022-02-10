import { writable } from 'svelte/store';
import { ethers, providers } from 'ethers';
import { VaultTypes } from '@stores/v2/types';

export type BalanceType = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: ethers.BigNumber;
};

export type BodyVaultType = {
  symbol: string;
  address: string;
  balance: ethers.BigNumber;
  decimals: number;
  yieldPerShare: ethers.BigNumber;
  underlyingPerShare: ethers.BigNumber;
  underlyingSymbol: string;
  underlyingBalance: ethers.BigNumber;
  underlyingDecimals: number;
  isUsed: boolean;
  tvl: ethers.BigNumber;
  debt: any;
};

export type TokensType = {
  [key in VaultTypes]?: {
    yieldTokens: string[];
    underlyingTokens: string[];
  };
};

export type VaultsType = {
  [key in VaultTypes]?: {
    debt: any;
    ratio: ethers.BigNumber;
    vaultBody: BodyVaultType[];
  };
};

export interface AlcxStore {
  address: string;
  provider: providers.Web3Provider;
  ens: string;
  balances: BalanceType[];
  tokens: TokensType;
  vaults: VaultsType;
}

export const alcxStore = writable<AlcxStore>({
  address: undefined,
  provider: undefined,
  ens: undefined,
  balances: [],
  tokens: {},
  vaults: {},
});

export default alcxStore;
