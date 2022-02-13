import { VaultsType } from './alcxStore';
import { VaultTypes } from './types';
import { erc20Contract, contractWrapper } from '../../helpers/contractWrapper';
import { Signer, BigNumber, utils } from 'ethers';
import { VaultConstants } from './constants';
import { getUserGas } from '@helpers/getUserGas';
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

    const tx = await alchemistInstance.deposit(tokenAddress, amountYield, userAddressStore, {
      gasPrice: gas,
    });

    setPendingTx();

    await signerStore.provider.once(tx.hash, async (transaction) => {
      setSuccessTx(transaction.transactionHash);
      await fetchUpdateVaultByAddress(typeOfVault, tokenAddress, [signerStore, userAddressStore]);
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/deposit]: ${error}`);
  }
}

export async function depositUnderlying() {}

export async function mint() {}

export async function burn() {}

export async function repay() {}

export async function withdraw() {}

export async function withdrawUnderlying() {}
