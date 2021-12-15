import { ethers } from 'ethers';

const alchemist = require('../abi/AlchemistV2.json');
const tokenAlcx = require('../abi/AlchemixToken.json');
const tokenAlEth = require('../abi/AlEth.json');
const tokenAlUsd = require('../abi/AlToken.json');
const pools = require('../abi/StakingPools.json');
const transmuterBufferAlUsd = require('../abi/TransmuterBuffer_alUSD.json');
const transmuterDai = require('../abi/TransmuterV2_DAI.json');
const transmuterUsdc = require('../abi/TransmuterV2_USDC.json');
const transmuterUsdt = require('../abi/TransmuterV2_USDT.json');
const adapterYearnDai = require('../abi/YearnAdapter_DAI.json');
const adapterYearnUsdc = require('../abi/YearnAdapter_USDC.json');
const adapterYearnUsdt = require('../abi/YearnAdapter_USDT.json');

const contractLookup = {
  alchemist,
  tokenAlcx,
  tokenAlEth,
  tokenAlUsd,
  pools,
  transmuterBufferAlUsd,
  transmuterDai,
  transmuterUsdc,
  transmuterUsdt,
  adapterYearnDai,
  adapterYearnUsdc,
  adapterYearnUsdt,
};

/*
 * @dev exposes a contract's functions for usage
 * @params String define which contract to use
 * @returns new ethers contract instance
 */
export default function getContract(selector) {
  const contract = contractLookup[selector];
  const abi = contract.abi;
  const provider = new ethers.providers.JsonRpcProvider();
  const signer = provider.getSigner(0);
  return new ethers.Contract(contract.address, abi, signer);
}
