import { ethers } from 'ethers';

/*
 * @dev exposes a contract's functions for usage
 * @params String define which contract to use
 * @returns new ethers contract instance
 */
export default function getContract(selector) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const contract = require(`../abi/${selector}.json`);
  const abi = contract.abi;
  const provider = new ethers.providers.JsonRpcProvider();
  const signer = provider.getSigner(0);
  return new ethers.Contract(contract.address, abi, signer);
}
