import { ContractTransaction, ethers } from 'ethers';
import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';
import { chainIds } from './constants';

export async function deposit(
  tokenAddress: string,
  amountToDeposit: ethers.BigNumber,
  transmuterSelector: string,
  [signer, addressStore]: [ethers.Signer, string],
  _network: string,
) {
  try {
    const path = chainIds.filter((item) => item.id === _network)[0].abiPath;
    const { instance: transmuterInstance, address: transmuterAddress } = await contractWrapper(
      transmuterSelector,
      signer,
      path,
    );

    const tokenInstance = erc20Contract(tokenAddress, signer);

    const allowance = await tokenInstance.allowanceOf(addressStore, transmuterAddress);

    if (amountToDeposit.gt(allowance)) {
      setPendingApproval();
      const sendApe = (await tokenInstance.approve(transmuterAddress)) as ethers.ContractTransaction;
      await sendApe.wait();
    }

    setPendingWallet();

    const tx = (await transmuterInstance.deposit(amountToDeposit, addressStore)) as ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/deposit]:`, error);
    throw Error(error);
  }
}

export async function withdraw(
  amountToWithdraw: ethers.BigNumber,
  transmuterSelector: string,
  [signer, addressStore]: [ethers.Signer, string],
  _network: string,
) {
  try {
    const path = chainIds.filter((item) => item.id === _network)[0].abiPath;

    const { instance: transmuterInstance } = await contractWrapper(transmuterSelector, signer, path);
    setPendingWallet();

    const tx = (await transmuterInstance.withdraw(amountToWithdraw, addressStore)) as ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/withdraw]:`, error);
    throw Error(error);
  }
}

export async function claim(
  amountToClaim: ethers.BigNumber,
  transmuterSelector: string,
  [signer, addressStore]: [ethers.Signer, string],
  _network: string,
) {
  try {
    const path = chainIds.filter((item) => item.id === _network)[0].abiPath;

    const { instance: transmuterInstance } = await contractWrapper(transmuterSelector, signer, path);

    setPendingWallet();

    const tx = (await transmuterInstance.claim(amountToClaim, addressStore)) as ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/claim]:`, error);
    throw Error(error);
  }
}
