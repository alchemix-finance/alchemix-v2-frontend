import { ethers } from 'ethers';

export const contractWrapper = (selector: string, signer: ethers.Signer, address?: string) => {
  const contractData = require(`../abi/${selector}.json`);
  const _instance = new ethers.Contract(address || contractData.address, contractData.abi, signer);

  return {
    fragment: new ethers.utils.Interface(contractData.abi),
    address: contractData.address,
    instance: _instance,
  };
};
