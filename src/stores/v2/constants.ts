import { VaultTypes } from '@stores/v2/types';

export const VaultConstants = {
  [VaultTypes.alUSD]: {
    alchemistContractSelector: 'AlchemistV2_alUSD',
    gatewayContractSelector: {
      ATokenGateway_alUSD: [
        {
          aToken: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
          staticToken: '0xcE4a49d7ed99C7c8746B713EE2f0C9aA631688d8',
        },
        {
          aToken: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
          staticToken: '0xf591D878608e2e5c7D4f1E499330f4AB9BbaE37a',
        },
        {
          aToken: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
          staticToken: '0xBC11De1F20e83F0a6889B8c7A7868E722694E315',
        },
      ],
    },
    alToken: 'AlToken',
    legacy: 'Alchemist',
  },
  [VaultTypes.alETH]: {
    alchemistContractSelector: 'AlchemistV2_alETH',
    gatewayContractSelector: {
      WETHGateway: ['eth'],
      ATokenGateway_alETH: [
        {
          aToken: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
          staticToken: '0x61134511187a9a2DF38D10DBe07Ba2e8E5563967',
        },
      ],
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

export const HiddenVaults = [
  '0x59417c1b2085e086f1EEB1AF0F40eE1dFD9c097f',
  '0xf350C6B7fbe5F6CB53c7D638Dfba9173A5722236',
  '0xC5c0D3e20DF4CA855281B4b5Bcf3bEf8D8068c75',
  '0x400509D00888c46903CF01495BB2eeAfD24F0f80',
];
export const VaultTypesInfos = {
  [VaultTypes.alUSD]: {
    name: 'alUSD',
    icon: 'images/icons/alusd_med.svg',
    useGateway: false,
    metaConfig: {
      '0xdA816459F1AB5631232FE5e97a05BBBb94970c95': {
        rewardAdapter: '',
        rewardType: 'APY',
        customTokenName: true,
        token: 'yvDAI',
        customAddress: '',
        vaultName: 'Yearn',
        beta: false,
        acceptGateway: false,
        acceptWETH: false,
        multicall: true,
        gateway: '',
        strategy: 'https://yearn.finance/#/vault/0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
      },
      '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE': {
        rewardAdapter: '',
        rewardType: 'APY',
        customTokenName: true,
        token: 'yvUSDC',
        customAddress: '',
        vaultName: 'Yearn',
        beta: false,
        acceptGateway: false,
        acceptWETH: false,
        multicall: true,
        gateway: '',
        strategy: 'https://yearn.finance/#/vault/0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE',
      },
      '0x7Da96a3891Add058AdA2E826306D812C638D87a7': {
        rewardAdapter: '',
        rewardType: 'APY',
        customTokenName: true,
        token: 'yvUSDT',
        customAddress: '',
        vaultName: 'Yearn',
        beta: false,
        acceptGateway: false,
        acceptWETH: false,
        multicall: true,
        gateway: '',
        strategy: 'https://yearn.finance/#/vault/0x7Da96a3891Add058AdA2E826306D812C638D87a7',
      },
      '0x3B27F92C0e212C671EA351827EDF93DB27cc0c65': {
        rewardAdapter: '',
        rewardType: 'APY',
        customTokenName: true,
        token: 'yvUSDT',
        customAddress: '',
        vaultName: 'Yearn',
        beta: true,
        acceptGateway: false,
        acceptWETH: false,
        multicall: true,
        gateway: '',
        strategy: 'https://yearn.finance/#/vault/0x3B27F92C0e212C671EA351827EDF93DB27cc0c65',
      },
      '0x028171bCA77440897B824Ca71D1c56caC55b68A3': {
        gateway: 'ATokenGateway_alUSD',
      },
      '0xBcca60bB61934080951369a648Fb03DF4F96263C': {
        gateway: 'ATokenGateway_alUSD',
      },
      '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811': {
        gateway: 'ATokenGateway_alUSD',
      },
      '0xcE4a49d7ed99C7c8746B713EE2f0C9aA631688d8': {
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
        gateway: 'ATokenGateway_alUSD',
        strategy:
          'https://app.aave.com/reserve-overview/?underlyingAsset=0x6b175474e89094c44da98b954eedeac495271d0f&marketName=proto_mainnet',
      },
      '0xf591D878608e2e5c7D4f1E499330f4AB9BbaE37a': {
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
        gateway: 'ATokenGateway_alUSD',
        strategy:
          'https://app.aave.com/reserve-overview/?underlyingAsset=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&marketName=proto_mainnet',
      },
      '0xBC11De1F20e83F0a6889B8c7A7868E722694E315': {
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
        gateway: 'ATokenGateway_alUSD',
        strategy:
          'https://app.aave.com/reserve-overview/?underlyingAsset=0xdac17f958d2ee523a2206206994597c13d831ec7&marketName=proto_mainnet',
      },
    },
  },
  [VaultTypes.alETH]: {
    name: 'alETH',
    icon: 'images/icons/aleth_med.svg',
    useGateway: true,
    metaConfig: {
      '0xa258C4606Ca8206D8aA700cE2143D7db854D168c': {
        rewardAdapter: '',
        rewardType: 'APY',
        customTokenName: true,
        token: 'yvWETH',
        customAddress: '',
        vaultName: 'Yearn',
        beta: false,
        acceptGateway: true,
        acceptWETH: true,
        multicall: true,
        gateway: 'WETHGateway',
        strategy: 'https://yearn.finance/#/vault/0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
      },
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
        gateway: 'WETHGateway',
        strategy: 'https://etherscan.io/token/0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
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
        gateway: '',
        strategy: 'https://stake.rocketpool.net/',
      },
      '0x80Ca99D65A8855Cb20e44A5e9B6C6AbF71E3739d': {
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
        gateway: '',
        strategy: 'https://stake.rocketpool.net/',
      },
      '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e': {
        gateway: 'ATokenGateway_alETH',
      },
      '0x61134511187a9a2DF38D10DBe07Ba2e8E5563967': {
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
        gateway: 'ATokenGateway_alETH',
        strategy:
          'https://app.aave.com/reserve-overview/?underlyingAsset=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&marketName=proto_mainnet',
      },
    },
  },
};

export const vaultMessages = [
  {
    vault: '0x7Da96a3891Add058AdA2E826306D812C638D87a7',
    level: 0,
    message:
      'Deposit on this vault is paused. Yearn is deprecating this Vault in favor of their new yvUSDT vault. Please migrate your position.',
  },
  {
    vault: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    level: 1,
    message:
      'The updated vault uses Uniswap, so will be subject to the rETH/ETH spread when the rETH buffer does not contain enough ETH for a direct withdrawal.',
  },
];

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
