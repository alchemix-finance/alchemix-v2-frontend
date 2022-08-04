import { ethers } from 'ethers';
import account from '@stores/account';

let _account;

account.subscribe((val) => {
  _account = val;
});

/*
 * @dev exposes a contract's functions for usage
 * @param selector the contract's filename without extension
 * @returns new ethers contract instance
 */
export default async function getContract(selector, path) {
  const contract = await import(`../abi/${path}/${selector}.json`);
  const abi = contract.abi;
  return new ethers.Contract(contract.address, abi, _account.signer);
}

/*
 * @dev returns a contract's address from the json
 * @param contract the contract's filename without extension
 * @returns the address string
 * */
export async function getAddress(selector, path) {
  const contract = await import(`../abi/${path}/${selector}.json`);
  return contract.address;
}
