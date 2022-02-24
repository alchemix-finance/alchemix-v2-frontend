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
  uuid: string;
  tokenAddress: string;
  tokenSymbol: string;
  isActive: boolean;
  userDeposit: ethers.BigNumber;
  tvl: ethers.BigNumber | ethers.BigNumber[];
  rewards: {}[];
  userUnclaimed: ethers.BigNumber[];
}

export interface InternalFarmType extends GenericFarmType {
  rewardRate: ethers.BigNumber;
  rewardToken: string;
  poolId: number;
}

export interface SushiFarmType extends GenericFarmType {
  tokenBalance: ethers.BigNumber;
  totalDeposit: ethers.BigNumber;
  underlyingAddresses: string[];
  poolTokenAddress: string;
}

export interface CurveFarmType extends GenericFarmType {
  rewards: ethers.BigNumber[];
}

export const castToInternalFarmType = (farm: any) => {
  return farm as InternalFarmType;
};

export const castToSushiFarmType = (farm: any) => {
  return farm as SushiFarmType;
};
