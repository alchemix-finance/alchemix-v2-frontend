import { BigNumber, constants, ethers } from 'ethers';
import { genericAbi } from '@stores/externalContracts';

export const contractWrapper = (selector: string, signer: ethers.Signer, address?: string) => {
  const contractData = require(`../abi/${selector}.json`);
  const _instance = new ethers.Contract(address || contractData.address, contractData.abi, signer);

  return {
    fragment: new ethers.utils.Interface(contractData.abi),
    address: contractData.address,
    instance: _instance,
  };
};

export const externalContractWrapper = (selector: string, signer: ethers.Signer, address?: string) => {
  const contractData = require(`../external-abi/${selector}.json`);
  const _instance = new ethers.Contract(address || contractData.address, contractData.abi, signer);

  return {
    fragment: new ethers.utils.Interface(contractData.abi),
    address: contractData.address,
    instance: _instance,
  };
};

/** 
 * const setTokenAllowance = async (token, spender, amount) => {
  console.log('setting allowance', token, spender);
  const amountInfinite = ethers.constants.MaxUint256;
  const contract = new ethers.Contract(token, genericAbi, _account.signer);
  await contract.approve(spender, amount || amountInfinite);
};

 *
 */

export const erc20Contract = (address: string, signer: ethers.Signer) => {
  const _contract = new ethers.Contract(address, genericAbi, signer);

  return {
    name: async () => _contract.name(),
    symbol: async () => _contract.symbol(),
    decimals: async () => _contract.decimals(),
    totalSupply: async () => _contract.totalSupply(),
    balanceOf: async (walletAddress: string) => _contract.balanceOf(walletAddress),
    allowanceOf: async (owner: string, spender: string) => _contract.allowance(owner, spender),
    approve: async (spender: string, amount: BigNumber = constants.MaxUint256) =>
      _contract.approve(spender, amount),
  };
};
