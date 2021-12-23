import { ethers } from 'ethers';
import { genericAbi } from '../stores/externalContracts';
import account from '../stores/account';

let _account;

account.subscribe((val) => {
  _account = val;
});

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

/*
 * @dev retrieves balance for a specific token
 * @params String the token address
 * @returns String the token balance
 * */
const getTokenBalance = async (address) => {
  const contract = new ethers.Contract(address, genericAbi, provider);
  return contract.balanceOf(_account.address);
};

export { getTokenSymbol, getTokenBalance };
