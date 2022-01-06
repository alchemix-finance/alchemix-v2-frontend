import { ethers } from 'ethers';
import account from '../stores/account';

let _account;

const Iface = ethers.utils.Interface;

account.subscribe((val) => {
  _account = val;
});

/*
 * @dev exposes a contract's functions for usage
 * @param selector the contract's filename without extension
 * @returns new ethers contract instance
 */
export default function getContract(selector) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const contract = require(`../abi/${selector}.json`);
  const abi = contract.abi;
  return new ethers.Contract(contract.address, abi, _account.signer);
}

/*
 * @dev returns a contract's fragment
 * @param contract the contract's filename without extension
 * @returns new contract interface
 * */
export function getFragment(selector) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const contract = require(`../abi/${selector}.json`);
  return new Iface(contract.abi);
}

/*
 * @dev returns a contract's address from the json
 * @param contract the contract's filename without extension
 * @returns the address string
 * */
export function getAddress(selector) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const contract = require(`../abi/${selector}.json`);
  return contract.address;
}
