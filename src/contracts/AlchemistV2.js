import { ethers } from 'ethers';

const setup = require('../abi/AlchemistV2.json');

const abi = setup.abi;
const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner(0);

export default new ethers.Contract(setup.address, abi, signer);
