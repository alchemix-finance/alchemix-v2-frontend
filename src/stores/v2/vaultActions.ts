import { VaultsType } from './alcxStore';
import { VaultTypes } from './types';
import { erc20Contract, contractWrapper } from '../../helpers/contractWrapper';
import { Signer, BigNumber, utils, ethers } from 'ethers';
import { VaultConstants } from './constants';
import getUserGas from '@helpers/getUserGas';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';

export async function deposit(
  tokenAddress: string,
  typeOfVault: VaultTypes,
  amountYield: BigNumber,
  [userAddressStore, signerStore]: [string, Signer],
) {
  try {
    const erc20Instance = erc20Contract(tokenAddress, signerStore);
    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    // The way you get the gas needs to be moved in a dependency property
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const allowance = await erc20Instance.allowanceOf(userAddressStore, alchemistAddress);

    if (BigNumber.from(allowance).lt(amountYield)) {
      setPendingApproval();
      await erc20Instance.approve(alchemistAddress);
    }

    setPendingWallet();

    const tx = (await alchemistInstance.deposit(tokenAddress, amountYield, userAddressStore, {
      gasPrice: gas,
    })) as ethers.ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        typeOfVault,
        tokenAddress,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/deposit]: ${error}`);
    throw Error(error);
  }
}

export async function depositUnderlying(
  underlyingAddress: string,
  tokenAddress: string,
  typeOfVault: VaultTypes,
  amountYield: BigNumber,
  [userAddressStore, signerStore]: [string, Signer],
) {
  try {
    const erc20Instance = erc20Contract(underlyingAddress, signerStore);
    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const dataPackage = utils.parseEther('0');

    const allowance = await erc20Instance.allowanceOf(userAddressStore, alchemistAddress);

    if (BigNumber.from(allowance).lt(amountYield)) {
      setPendingApproval();
      await erc20Instance.approve(alchemistAddress);
    }

    setPendingWallet();

    const tx = (await alchemistInstance.depositUnderlying(
      tokenAddress,
      amountYield,
      userAddressStore,
      dataPackage,
      {
        gasPrice: gas,
      },
    )) as ethers.ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        typeOfVault,
        tokenAddress,
        underlyingAddress,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/depositUnderlying]: ${error}`);
    throw Error(error);
  }
}

export async function multicallDeposit(
  typeOfVault: VaultTypes,
  yieldTokenAddress: string,
  underlyingTokenAddress: string,
  amountUnderlying: BigNumber,
  amountYield: BigNumber,
  [userAddressStore, signerStore]: [string, Signer],
) {
  try {
    const yieldTokenInstance = erc20Contract(yieldTokenAddress, signerStore);
    const underlyingTokenInstance = erc20Contract(underlyingTokenAddress, signerStore);

    const {
      address: alchemistAddress,
      instance: alchemistInstance,
      fragment: alchemistInterface,
    } = contractWrapper(VaultConstants[typeOfVault].alchemistContractSelector, signerStore);

    const yieldTokenAllowance = await yieldTokenInstance.allowanceOf(userAddressStore, alchemistAddress);
    const underlyingTokenAllowance = await underlyingTokenInstance.allowanceOf(
      userAddressStore,
      alchemistAddress,
    );

    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

    if (BigNumber.from(yieldTokenAllowance).lt(amountYield)) {
      setPendingApproval();
      await yieldTokenInstance.approve(alchemistAddress);
    }

    if (BigNumber.from(underlyingTokenAllowance).lt(amountUnderlying)) {
      setPendingApproval();
      await underlyingTokenInstance.approve(alchemistAddress);
    }

    const deposit = alchemistInterface.encodeFunctionData('deposit', [
      yieldTokenAddress,
      amountYield,
      userAddressStore,
    ]);
    const underlyingData = utils.defaultAbiCoder.encode(['bytes[]'], [[]]);

    const depositUnderlying = alchemistInterface.encodeFunctionData('depositUnderlying', [
      yieldTokenAddress,
      amountUnderlying,
      userAddressStore,
      underlyingData,
    ]);
    const dataPackage = [deposit, depositUnderlying];

    setPendingWallet();

    const tx = (await alchemistInstance.multicall(dataPackage, {
      gasPrice: gas,
    })) as ethers.ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return { yieldTokenAddress, underlyingTokenAddress, typeOfVault };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/multicallDeposit]: ${error}`);
    throw Error(error);
  }
}

export async function mint() {}

export async function burn() {}

export async function repay() {}

export async function withdraw(
  typeOfVault: VaultTypes,
  yieldTokenAddress: string,
  yieldAmount: BigNumber,
  accountAddress: string,
  [signerStore]: [Signer],
) {
  try {
    const {
      address: alchemistAddress,
      instance: alchemistInstance,
      fragment: alchemistInterface,
    } = contractWrapper(VaultConstants[typeOfVault].alchemistContractSelector, signerStore);

    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    setPendingWallet();
    const tx = (await alchemistInstance.withdraw(yieldTokenAddress, yieldAmount, accountAddress, {
      gasPrice: gas,
    })) as ethers.ContractTransaction;

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        yieldTokenAddress,
        typeOfVault,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/withdraw]: ${error}`);
    throw Error(error);
  }
}

export async function withdrawUnderlying() {}

export async function multicallWithdraw() {}
