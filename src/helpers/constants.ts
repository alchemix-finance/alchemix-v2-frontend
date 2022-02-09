import { VaultType } from '@stores/v2/types';

export enum VaultTypes {
  alUSD = 0,
  alETH = 1,
}

export const VaultData = {
  [VaultType.alUSD]: {
    alchemistContractSelector: 'AlchemistV2_alUSD',
  },
};
