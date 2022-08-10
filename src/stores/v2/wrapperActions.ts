import { contractWrapper, externalContractWrapper } from '@helpers/contractWrapper';
import type { Signer, BigNumber, ContractTransaction } from 'ethers';
import setTokenAllowance from '@helpers/setTokenAllowance';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';

export async function getData(_signer: Signer) {
  try {
    const { instance: galcxInstance } = await externalContractWrapper('galcx', _signer);
    const supply = await galcxInstance.totalSupply();
    const exchangeRate = await galcxInstance.exchangeRate();
    const symbol = await galcxInstance.symbol();
    return { supply, exchangeRate, symbol };
  } catch (error) {
    setError(error.data ? await error.data.message : error.message, error);
    console.error(`[wrapperActions/getSupply]: ${error}`);
    throw Error(error);
  }
}

export async function getAllowance([_ownerAddress, _signer]: [string, Signer]) {
  try {
    const { instance: alcxInstance } = await await contractWrapper('AlchemixToken', _signer, 'ethereum');
    const { address: galcxAddress } = await externalContractWrapper('galcx', _signer);
    const allowance = await alcxInstance.allowance(_ownerAddress, galcxAddress);
    return { allowance };
  } catch (error) {
    setError(error.data ? await error.data.message : error.message, error);
    console.error(`[wrapperActions/getAllowance]: ${error}`);
    throw Error(error);
  }
}

export async function setAllowance(_signer: Signer) {
  try {
    const { address: alcxAddress } = await await contractWrapper('AlchemixToken', _signer, 'ethereum');
    const { address: galcxAddress } = await externalContractWrapper('galcx', _signer);
    setPendingApproval();
    // @ts-ignore
    const approval = (await setTokenAllowance(alcxAddress, galcxAddress)) as ContractTransaction;
    setPendingTx();
    return approval;
  } catch (error) {
    setError(error.data ? await error.data.message : error.message, error);
    console.error(`[wrapperActions/setAllowance]: ${error}`);
    throw Error(error);
  }
}

export async function stake(_amount: BigNumber, _allowance: BigNumber, _signer: Signer) {
  const { instance: galcxInstance, address: galcxAddress } = await externalContractWrapper('galcx', _signer);
  try {
    if (_allowance.lt(_amount)) {
      const { instance: alcxInstance } = await contractWrapper('AlchemixToken', _signer, 'ethereum');
      setPendingApproval();
      const sendApe = (await alcxInstance.approve(galcxAddress, _amount)) as ContractTransaction;
      await sendApe.wait();
    }
    setPendingWallet();
    const tx = (await galcxInstance.stake(_amount)) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return true;
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message, error);
    console.error(`[wrapperActions/stake]: ${error}`);
    throw Error(error);
  }
}

export async function unstake(_amount: BigNumber, _signer: Signer) {
  const { instance: galcxInstance } = await externalContractWrapper('galcx', _signer);
  try {
    setPendingWallet();
    const tx = (await galcxInstance.unstake(_amount)) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return true;
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message, error);
    console.error(`[wrapperActions/unstake]: ${error}`);
    throw Error(error);
  }
}
