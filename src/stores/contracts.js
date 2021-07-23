import { writable } from 'svelte/store';

const contracts = writable({
  chainId: undefined,
  alchemix: {
    alchemist: {
      address: undefined,
      eth: undefined,
      dai: undefined,
    },
    transmuter: {
      address: undefined,
      vaultAdapter: undefined,
      eth: undefined,
      dai: undefined,
      yearnEthVaultAdapter: undefined,
    },
    token: {
      alEth: undefined,
      alUsd: undefined,
      alcx: undefined,
      wEth: undefined,
      dai: undefined,
      alcxEthSlp: undefined,
    },
    pool: {
      staking: undefined,
    },
  },
  yearn: {
    vaultAdapter: {
      address: undefined,
      eth: undefined,
    },
  },
  curve: {
    gauge: {
      alUsd: undefined,
    },
    minter: undefined,
    rewarder: undefined,
    pool: {
      alUsd: undefined,
    },
  },
  sushi: {
    pool: undefined,
    mcv2: undefined,
    mcv1: undefined,
    onsenRewarder: {
      alcx: undefined,
    },
  },
  saddle: {
    pool: {
      alEth: undefined,
    },
  },
});

export default contracts;
