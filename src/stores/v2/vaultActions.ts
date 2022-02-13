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
import { fetchUpdateVaultByAddress } from './asyncMethods';

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
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.log(error);
  }
}

export async function mint() {}

export async function burn() {}

export async function repay() {}

/**  const withdraw = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const refreshPayload = {
      token: $tempTx.yieldToken,
      vaultIndex: $tempTx.vaultIndex,
    };
    try {
      setPendingWallet();
      const tx = await contract.withdraw(
        $tempTx.yieldToken,
        $tempTx.amountYield,
        $tempTx.targetAddress || $account.address,
        {
          gasPrice: gas,
        },
      );
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
        refreshData(refreshPayload);
      });
    } catch (e) {
      console.error(e);
      setError(e.data ? await e.data.message : e.message);
    }
    tempClear();
  };*/

export async function withdraw() {}

export async function withdrawUnderlying() {}
