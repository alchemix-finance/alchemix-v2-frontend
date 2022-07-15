import { VaultTypes } from '@stores/v2/types';

export const VaultConstants = {
  [VaultTypes.alUSD]: {
    alchemistContractSelector: 'AlchemistV2_alUSD',
    gatewayContractSelector: {
      ATokenGateway_alUSD: [
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
        '0xBcca60bB61934080951369a648Fb03DF4F96263C',
        '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
      ],
    },
    alToken: 'AlToken',
    legacy: 'Alchemist',
  },
  [VaultTypes.alETH]: {
    alchemistContractSelector: 'AlchemistV2_alETH',
    gatewayContractSelector: {
      WETHGateway: ['eth'],
      ATokenGateway_alETH: ['0x030bA81f1c18d280636F32af80b9AAd02Cf0854e'],
    },
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
  fusdt: 'de Rais',
};

export const AllowedVaultTypes = [VaultTypes.alUSD, VaultTypes.alETH];
export const AllowedTransmuterTypes = [VaultTypes.alUSD, VaultTypes.alETH];
export const AllowedAdapterTypes = [VaultTypes.alUSD, VaultTypes.alETH];

export const VaultTypesInfos = {
  [VaultTypes.alUSD]: {
    name: 'alUSD',
    icon: 'images/icons/alusd_med.svg',
    useGateway: false,
    metaConfig: {
      '0x59417c1b2085e086f1EEB1AF0F40eE1dFD9c097f': {
        rewardAdapter: 'aave',
        rewardType: 'APR',
        customTokenName: true,
        token: 'aDAI',
        customAddress: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
        vaultName: 'AAVE',
        beta: true,
        acceptGateway: true,
        acceptWETH: false,
        multicall: false,
      },
      '0xf350C6B7fbe5F6CB53c7D638Dfba9173A5722236': {
        rewardAdapter: 'aave',
        rewardType: 'APR',
        customTokenName: true,
        token: 'aUSDC',
        customAddress: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
        vaultName: 'AAVE',
        beta: true,
        acceptGateway: true,
        acceptWETH: false,
        multicall: false,
      },
      '0xC5c0D3e20DF4CA855281B4b5Bcf3bEf8D8068c75': {
        rewardAdapter: 'aave',
        rewardType: 'APR',
        customTokenName: true,
        token: 'aUSDT',
        customAddress: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
        vaultName: 'AAVE',
        beta: true,
        acceptGateway: true,
        acceptWETH: false,
        multicall: false,
      },
    },
  },
  [VaultTypes.alETH]: {
    name: 'alETH',
    icon: 'images/icons/aleth_med.svg',
    useGateway: true,
    metaConfig: {
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': {
        rewardAdapter: 'lido',
        rewardType: 'APR',
        customTokenName: false,
        token: '',
        customAddress: '',
        vaultName: 'Lido',
        beta: false,
        acceptGateway: true,
        acceptWETH: true,
        multicall: true,
      },
      '0xae78736Cd615f374D3085123A210448E74Fc6393': {
        rewardAdapter: 'rocketPool',
        rewardType: 'APR',
        customTokenName: false,
        token: '',
        customAddress: '',
        vaultName: 'Rocket',
        beta: false,
        acceptGateway: false,
        acceptWETH: false,
        multicall: false,
      },
      '0x400509D00888c46903CF01495BB2eeAfD24F0f80': {
        rewardAdapter: 'aave',
        rewardType: 'APR',
        customTokenName: true,
        token: 'aWETH',
        customAddress: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
        vaultName: 'AAVE',
        beta: true,
        acceptGateway: true,
        acceptWETH: true,
        multicall: false,
      },
    },
  },
};

export const chainIds = [
  {
    id: '0x1',
    legacyId: 1,
    name: 'Ethereum Mainnet',
    icon: 'ethereum',
    abiPath: 'ethereum',
    rpcUrl: null,
    explorer: 'https://etherscan.io/',
    token: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
    },
    vaultTypes: [VaultTypes.alUSD, VaultTypes.alETH],
  },
  {
    id: '0xfa',
    legacyId: 250,
    name: 'Fantom Opera',
    icon: 'fantom',
    abiPath: 'fantom',
    rpcUrl: 'https://rpc.ftm.tools',
    explorer: 'https://ftmscan.com/',
    token: {
      symbol: 'FTM',
      name: 'Fantom',
      decimals: 18,
    },
    vaultTypes: [VaultTypes.alUSD],
  },
  {
    id: '0xa4b1',
    legacyId: 42161,
    name: 'Arbitrum One',
    icon: 'arbitrum',
    abiPath: 'arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io/',
    token: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
    },
    vaultTypes: [],
  },
  {
    id: '0xa',
    legacyId: 10,
    name: 'Optimism',
    icon: 'optimism',
    abiPath: 'optimism',
    rpcUrl: 'https://mainnet.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    token: {
      symbol: 'OP',
      name: 'Optimism',
      decimals: 18,
    },
    vaultTypes: [],
  },
];
