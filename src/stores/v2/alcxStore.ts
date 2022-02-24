import { writable } from 'svelte/store';
import { ethers, providers } from 'ethers';
import { FarmTypes, VaultTypes } from '@stores/v2/types';

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
  apy: number;
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
    debtTokenAddress: string;
    vaultBody: BodyVaultType[];
  };
}

export interface TransmuterType {
  type: VaultTypes;
  contractSelector: string;
  transmuterAddress: string;
  synthAddress: string;
  underlyingTokenAddress: string;
  totalUnexchangedBN: ethers.BigNumber;
  exchangedBalanceBN: ethers.BigNumber;
  unexchangedBalanceBN: ethers.BigNumber;
}

export interface TransmutersType {
  [key: number]: {
    transmuters: TransmuterType[];
  };
}

export interface FarmStoreType {
  type: FarmTypes;
  body: any;
}

export const addressStore = writable<string>(undefined);
export const providerStore = writable<providers.Web3Provider>(undefined);
export const balancesStore = writable<BalanceType[]>([]);
export const tokensStore = writable<TokensType>({});
export const vaultsStore = writable<VaultsType>({});
export const transmutersStore = writable<TransmutersType>({});
export const sentinelStore = writable<boolean>(undefined);
export const controllerStore = writable<[]>([]);

export const farmsStore = writable<FarmStoreType[]>([]);
