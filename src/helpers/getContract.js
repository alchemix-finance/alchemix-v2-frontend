import { ethers } from 'ethers';
import account from '../stores/account';

let _account;

account.subscribe((val) => {
  _account = val;
});

/*
 * @dev exposes a contract's functions for usage
 * @params String define which contract to use
 * @returns new ethers contract instance
 */
export default function getContract(selector) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const contract = require(`../abi/${selector}.json`);
  const abi = contract.abi;
  return new ethers.Contract(contract.address, abi, _account.signer);
}
