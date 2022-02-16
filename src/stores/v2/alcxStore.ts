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
  type: VaultTypes;
  address: string;
  balance: ethers.BigNumber;
  yieldPerShare: ethers.BigNumber;
  underlyingAddress: string;
  underlyingPerShare: ethers.BigNumber;
  tvl: ethers.BigNumber;
};

export interface TokensType {
  [key: number]: {
    yieldTokens: string[];
    underlyingTokens: string[];
  };
}

export interface VaultsType {
  [key: number]: {
    debt: any;
    ratio: ethers.BigNumber;
    debtToken: string;
    vaultBody: BodyVaultType[];
  };
}

export const addressStore = writable<string>(undefined);
export const providerStore = writable<providers.Web3Provider>(undefined);
export const balancesStore = writable<BalanceType[]>([]);
export const tokensStore = writable<TokensType>({});
export const vaultsStore = writable<VaultsType>({});
