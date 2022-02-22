import { ethers } from 'ethers';

export enum VaultTypes {
  alUSD = 0,
  alETH = 1,
}

export enum FarmTypes {
  INTERNAL = 0,
  SUSHI = 1,
  CRV = 2,
}

export enum FarmStatus {
  Active = 0,
  Retired = 1,
}

export interface InternalFarmType {
  tokenAddress: string;
  rewardRate: ethers.BigNumber;
  tvl: ethers.BigNumber;
  rewardToken: string;
  userDeposit: ethers.BigNumber;
  userUnclaimed: ethers.BigNumber;
}

export interface SushiFarmType {
  tokenAddress: string;
}

export interface CurveFarmType {
  tokenAddress: string;
}
