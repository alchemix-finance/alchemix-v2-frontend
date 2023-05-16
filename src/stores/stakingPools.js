import { writable } from 'svelte/store';

const defaults = {
  fetching: true,
  pools: 0,
  allPools: [],
  active: [],
  retired: [],
};

const stakingPools = writable({
  ...defaults,
});

export const stakingPoolsReset = () => {
  stakingPools.set({ ...defaults });
};

export const additionalTokens = [
  {
    network: '0x1',
    address: '0x93Dede06AE3B5590aF1d4c111BC54C3f717E4b35',
  },
  {
    network: '0xfa',
    address: '0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E',
  },
  {
    network: '0xfa',
    address: '0x70F9fd19f857411b089977E7916c05A0fc477Ac9',
  },
  {
    network: '0x1',
    address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
  },
  {
    network: '0x1',
    address: '0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8',
  },
  {
    network: '0xa4b1',
    address: '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
  },
  {
    network: '0xa4b1',
    address: '0x870d36B8AD33919Cc57FFE17Bb5D3b84F3aDee4f',
  },
  {
    network: '0x1',
    address: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
  },
  {
    network: '0x1',
    address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
  },
  {
    network: '0x1',
    address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
  },
  {
    network: '0x1',
    address: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
  },
  {
    network: '0xa',
    address: '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
  },
  {
    network: '0xa',
    address: '0x3E29D3A9316dAB217754d13b28646B76607c5f04',
  },
  {
    network: '0xa',
    address: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE',
  },
  {
    network: '0xa',
    address: '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
  },
  {
    network: '0xa',
    address: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
  },
  {
    network: '0xa',
    address: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
  },
  {
    network: '0x1',
    address: '0x853d955acef822db058eb8505911ed77f175b99e',
  },
  {
    network: '0x1',
    address: '0xd4937682df3C8aEF4FE912A96A74121C0829E664',
  },
  {
    network: '0x1',
    address: '0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8',
  },
  {
    network: '0x1',
    address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
  },
  {
    network: '0x1',
    address: '0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e',
  },
  {
    network: '0x1',
    address: '0xBE1C919cA137299715e9c929BC7126Af14f76091',
  },
  {
    network: '0x1',
    address: '0xf16aEe6a71aF1A9Bc8F56975A4c2705ca7A782Bc',
  },
  {
    network: '0x1',
    address: '0xA0657642224Fc53dAB4a3d2069430afe157BEc5D',
  },
];

export const externalLookup = [
  {
    // SushiSwap MasterChef V2
    address: '0xEF0881eC094552b2e128Cf945EF17a6752B4Ec5d',
    token: '0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8',
    title: 'ALCX/ETH v2',
    subtitle: 'SushiSwap LP',
    farmIcon: undefined,
    tokenIcon: 'sushi',
    network: '0x1',
  },
  {
    // Convex alUSD3CRV
    address: '0x02E2151D4F351881017ABdF2DD2b51150841d5B3',
    token: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
    title: 'alUSD3CRV Convex Boosted',
    subtitle: 'Curve LP',
    farmIcon: undefined,
    tokenIcon: 'cvx',
    network: '0x1',
  },
  {
    // Convex alETH
    address: '0x48Bc302d8295FeA1f8c3e7F57D4dDC9981FEE410',
    token: '0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e',
    title: 'alETH Convex Boosted',
    subtitle: 'Curve LP',
    farmIcon: undefined,
    tokenIcon: 'cvx',
    network: '0x1',
  },
  {
    // FRAX-Convex alusdFRAXBP
    address: '0x711d650Cd10dF656C2c28D375649689f137005fA',
    token: '0xBE1C919cA137299715e9c929BC7126Af14f76091',
    title: 'alUSDFRAXBP Frax-Convex Boosted',
    subtitle: 'Curve LP',
    farmIcon: undefined,
    tokenIcon: 'cvx',
    network: '0x1',
  },
  {
    // FRAX-Convex ALCX-FRAXBP
    address: '0xAF1b82809296E52A42B3452c52e301369Ce20554',
    token: '0xA0657642224Fc53dAB4a3d2069430afe157BEc5D',
    title: 'ALCX-FRAXBP Frax-Convex Boosted',
    subtitle: 'Curve LP',
    farmIcon: undefined,
    tokenIcon: 'cvx',
    network: '0x1',
  },
  {
    // Balancer 80ALCX/20WETH
    address: '0xA57b8d98dAE62B26Ec3bcC4a365338157060B234',
    token: '0xf16aEe6a71aF1A9Bc8F56975A4c2705ca7A782Bc',
    title: 'Aura Boosted',
    subtitle: 'Balancer LP',
    farmIcon: undefined,
    tokenIcon: 'aura',
    network: '0x1',
  },
  {
    // Curve alUSD3CRV
    address: '0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c',
    title: 'alUSD3CRV v2',
    subtitle: 'Curve alUSD Metapool',
    farmIcon: 'alusd_med.svg',
    tokenIcon: 'crv',
    network: '0x1',
  },
];

export const poolLookup = [
  {
    address: '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
    title: 'alUSD',
    subtitle: 'Alchemix alUSD',
    farmIcon: 'alusd_med.svg',
    tokenIcon: undefined,
    network: '0x1',
  },
  {
    address: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
    title: 'alETH',
    subtitle: 'Alchemix alETH',
    farmIcon: 'aleth_med.svg',
    tokenIcon: undefined,
    network: '0x1',
  },
  {
    address: '0xdbdb4d16eda451d0503b854cf79d55697f90c8df',
    title: 'ALCX',
    subtitle: 'Alchemix ALCX',
    farmIcon: undefined,
    tokenIcon: undefined,
    network: '0x1',
  },
  {
    address: '0xc3f279090a47e80990fe3a9c30d24cb117ef91a8',
    title: 'ALCX/ETH v1',
    subtitle: 'SushiSwap LP',
    farmIcon: undefined,
    tokenIcon: 'sushi',
    network: '0x1',
  },
  {
    address: '0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c',
    title: 'alUSD3CRV',
    subtitle: 'Curve alUSD Metapool',
    farmIcon: 'alusd_med.svg',
    tokenIcon: 'crv',
    network: '0x1',
  },
  {
    address: '0xc9da65931abf0ed1b74ce5ad8c041c4220940368',
    title: 'Saddle alETH',
    subtitle: 'Saddle LP',
    farmIcon: undefined,
    tokenIcon: 'saddle',
    network: '0x1',
  },
  {
    address: '0xc4c319e2d4d66cca4464c0c2b32c9bd23ebe784e',
    title: 'alETH Curve',
    subtitle: 'Curve alETH Metapool',
    farmIcon: undefined,
    tokenIcon: 'crv',
    network: '0x1',
  },
  {
    address: '0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84',
    title: 'tALCX',
    subtitle: 'Tokemak',
    farmIcon: undefined,
    tokenIcon: 'talcx',
    network: '0x1',
  },
];

export default stakingPools;
