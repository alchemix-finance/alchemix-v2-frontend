import { ethers } from 'ethers';
import { genericAbi } from '../stores/externalContracts';
import account from '../stores/account';

let _account;

account.subscribe((val) => {
  _account = val;
});

const setTokenAllowance = async (token, spender, amount) => {
  console.log('setting allowance', token, spender);
  const amountInfinite = ethers.constants.MaxUint256;
  const contract = new ethers.Contract(token, genericAbi, _account.signer);
  await contract.approve(spender, amount || amountInfinite);
};

export default setTokenAllowance;
