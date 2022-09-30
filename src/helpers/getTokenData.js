import { ethers, BigNumber } from 'ethers';
import { genericAbi } from '@stores/externalContracts';
import account from '@stores/account';
import network from '@stores/network';
import { getProvider } from '@helpers/walletManager';

let _account;
let _network;

account.subscribe((val) => {
  _account = val;
});

network.subscribe((val) => {
  _network = val;
});

// @ts-ignore
const provider = getProvider(_network.id);

/*
 * @dev retrieves symbol for a specific token
 * @param String the token address
 * @returns String the token symbol
 * */
const getTokenSymbol = async (address) => {
  const contract = new ethers.Contract(address, genericAbi, provider);
  return contract.symbol();
};

/*
 * @dev retrieves balance for a specific token
 * @param String the token address
 * @returns String the token balance
 * */
const getTokenBalance = async (address) => {
  const contract = new ethers.Contract(address, genericAbi, provider);
  return contract.balanceOf(_account.address);
};

/*
 * @dev retrieves name for a specific token
 * @param String the token address
 * @returns String the token name
 * */
const getTokenName = async (address) => {
  const contract = new ethers.Contract(address, genericAbi, provider);
  return contract.name();
};

/*
 * @dev retrieves decimals for a specific token
 * @param String the token address
 * @returns String the token decimals
 * */
const getTokenDecimals = async (address) => {
  const contract = new ethers.Contract(address, genericAbi, provider);
  return contract.decimals();
};

/*
 * @dev retrieves remaining allowance for a specific token
 * @param token the token to check
 * @param owner the owner of the allowance
 * @param spender the spender of the allowance
 * @param amount the amount in 18 decimal wei
 * @returns boolean has allowance for amount
 * */
const getTokenAllowance = async (token, owner, spender, amount) => {
  const _amount = amount ? amount : ethers.constants.MaxUint256;
  if (token && owner && spender) {
    const contract = new ethers.Contract(token, genericAbi, provider);
    const allowanceCheck = await contract.allowance(owner, spender);
    return allowanceCheck.sub(_amount).gt(BigNumber.from(0));
  }
};

export { getTokenSymbol, getTokenBalance, getTokenName, getTokenDecimals, getTokenAllowance };
