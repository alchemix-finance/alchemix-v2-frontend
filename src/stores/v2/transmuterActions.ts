import { ContractTransaction, ethers } from 'ethers';
import { gasResolver } from '@helpers/getUserGas';
import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';

export async function deposit(
  tokenAddress: string,
  amountToDeposit: ethers.BigNumber,
  transmuterSelector: string,
  [signer, addressStore]: [ethers.Signer, string],
) {
  try {
    const gasPrice = await gasResolver();
    const { instance: transmuterInstance, address: transmuterAddress } = contractWrapper(
      transmuterSelector,
      signer,
    );

    const tokenInstance = erc20Contract(tokenAddress, signer);

    const allowance = await tokenInstance.allowanceOf(addressStore, transmuterAddress);

    if (amountToDeposit.gt(allowance)) {
      setPendingApproval();
      await tokenInstance.approve(transmuterAddress);
    }

    setPendingWallet();

    const tx = (await transmuterInstance.deposit(amountToDeposit, addressStore, {
      gasPrice,
    })) as ContractTransaction;

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
) {
  try {
    const gasPrice = await gasResolver();

    const { instance: transmuterInstance } = contractWrapper(transmuterSelector, signer);
    setPendingWallet();

    const tx = (await transmuterInstance.withdraw(amountToWithdraw, addressStore, {
      gasPrice,
    })) as ContractTransaction;

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
) {
  try {
    const gasPrice = await gasResolver();
    const { instance: transmuterInstance } = contractWrapper(transmuterSelector, signer);

    setPendingWallet();

    const tx = (await transmuterInstance.claim(amountToClaim, addressStore, {
      gasPrice,
    })) as ContractTransaction;

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
