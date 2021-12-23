import { ethers } from 'ethers';
import { genericAbi } from '../stores/externalContracts';
import account from '../stores/account';

let _account;

account.subscribe((val) => {
  _account = val;
});

const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));
const provider = ethers.getDefaultProvider(debugging ? process.env.LOCAL_NETWORK_URL : 'homestead');

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

/*
 * @dev retrieves name for a specific token
 * @params String the token address
 * @returns String the token name
 * */
const getTokenName = async (address) => {
  const contract = new ethers.Contract(address, genericAbi, provider);
  return contract.name();
};

/*
 * @dev retrieves decimals for a specific token
 * @params String the token address
 * @returns String the token decimals
 * */
const getTokenDecimals = async (address) => {
  const contract = new ethers.Contract(address, genericAbi, provider);
  return contract.decimals();
};

export { getTokenSymbol, getTokenBalance, getTokenName, getTokenDecimals };
