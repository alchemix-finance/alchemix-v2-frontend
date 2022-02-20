import { VaultTypes } from '@stores/v2/types';

export const VaultConstants = {
  [VaultTypes.alUSD]: {
    alchemistContractSelector: 'AlchemistV2_alUSD',
  },
};

export const TransmuterConstants = {
  [VaultTypes.alUSD]: {
    transmuterContractSelectors: ['TransmuterV2_DAI', 'TransmuterV2_USDC', 'TransmuterV2_USDT'],
  },
};

export const AllowedVaultTypes = [VaultTypes.alUSD, VaultTypes.alETH];
export const AllowedTransmuterTypes = [VaultTypes.alUSD, VaultTypes.alETH];

export const VaultTypesInfos = {
  [VaultTypes.alUSD]: {
    name: 'alUSD',
    icon: 'images/icons/alusd_med.svg',
  },
  [VaultTypes.alETH]: {
    name: 'alETH',
    icon: 'images/icons/aleth_med.svg',
  },
};
