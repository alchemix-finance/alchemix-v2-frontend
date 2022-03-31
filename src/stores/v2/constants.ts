import { VaultTypes } from '@stores/v2/types';

export const VaultConstants = {
  [VaultTypes.alUSD]: {
    alchemistContractSelector: 'AlchemistV2_alUSD',
    gatewayContractSelector: null,
    alToken: 'AlToken',
    legacy: 'Alchemist',
  },
  [VaultTypes.alETH]: {
    alchemistContractSelector: 'AlchemistV2_alETH',
    gatewayContractSelector: 'WETHGateway',
    alToken: 'AlEth',
    legacy: 'AlchemistEth',
  },
};

export const TransmuterConstants = {
  [VaultTypes.alUSD]: {
    transmuterContractSelectors: ['TransmuterV2_DAI', 'TransmuterV2_USDC', 'TransmuterV2_USDT'],
  },
  [VaultTypes.alETH]: {
    transmuterContractSelectors: ['TransmuterV2_ETH'],
  },
};

export const AdapterConstants = {
  [VaultTypes.alUSD]: {
    adapterContractSelectors: ['YearnAdapter_DAI', 'YearnAdapter_USDC', 'YearnAdapter_USDT'],
  },
  [VaultTypes.alETH]: {
    adapterContractSelectors: ['YearnAdapter_WETH'],
  },
};

export const TransmuterNameAliases = {
  dai: 'Zosimos',
  usdc: 'Ge Hong',
  usdt: 'Paracelsus',
  weth: 'Van Helmont',
};

export const AllowedVaultTypes = [VaultTypes.alUSD, VaultTypes.alETH];
export const AllowedTransmuterTypes = [VaultTypes.alUSD, VaultTypes.alETH];
export const AllowedAdapterTypes = [VaultTypes.alUSD, VaultTypes.alETH];

export const VaultTypesInfos = {
  [VaultTypes.alUSD]: {
    name: 'alUSD',
    icon: 'images/icons/alusd_med.svg',
    useGateway: false,
    metaConfig: {},
  },
  [VaultTypes.alETH]: {
    name: 'alETH',
    icon: 'images/icons/aleth_med.svg',
    useGateway: true,
    metaConfig: {
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': {
        rewardAdapter: 'lido',
        rewardType: 'APR',
        vaultName: 'Lido',
        beta: true,
        acceptGateway: true,
        acceptWETH: true,
      },
      '0xae78736Cd615f374D3085123A210448E74Fc6393': {
        rewardAdapter: 'rocketPool',
        rewardType: 'APR',
        vaultName: 'Rocket',
        beta: true,
        acceptGateway: false,
        acceptWETH: false,
      },
    },
  },
};
