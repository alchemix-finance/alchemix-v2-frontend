import { ethers } from 'ethers';
import { genericAbi } from '../stores/externalContracts';

const provider = ethers.getDefaultProvider();

/*
 * @dev retrieves symbol for a specific token
 * @params String the token address
 * @returns String the token symbol
 * */
const getTokenSymbol = async (address) => {
  const contract = new ethers.Contract(address, genericAbi, provider);
  return contract.symbol();
};

export { getTokenSymbol };
