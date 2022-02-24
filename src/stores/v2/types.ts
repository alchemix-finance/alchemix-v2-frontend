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

export interface GenericFarmType {
  tokenAddress: string;
  tokenSymbol: string;
  isActive: boolean;
  userDeposit: ethers.BigNumber;
  tvl: ethers.BigNumber | ethers.BigNumber[];
}

export interface InternalFarmType extends GenericFarmType {
  rewardRate: ethers.BigNumber;
  rewardToken: string;
  userUnclaimed: ethers.BigNumber;
  poolId: number;
}

export interface SushiFarmType extends GenericFarmType {
  rewards: {}[];
  userUnclaimed: ethers.BigNumber[];
  tokenBalance: ethers.BigNumber;
  totalDeposit: ethers.BigNumber;
}

export interface CurveFarmType extends GenericFarmType {
  rewards: ethers.BigNumber[];
}

export const castToInternalFarmType = (farm: any) => {
  return farm as InternalFarmType;
};
