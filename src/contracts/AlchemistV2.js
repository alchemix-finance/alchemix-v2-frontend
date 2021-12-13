import { ethers } from 'ethers';

const setup = require('../abi/AlchemistV2.json');

const abi = setup.abi;
const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner(0);
const contract = new ethers.Contract(setup.address, abi, signer);

export const owner = async () => {
  await console.log('AlchemistV2 owner', contract.owner);
};
