// const deposit = async () => {
//   try {
//     const allowance = await getTokenAllowance($tempTx.yieldToken, $account.address, contract.address);
//     const decimals = await getTokenDecimals($tempTx.yieldToken);
//     const amountToWei = $tempTx.amountYield;
//     const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
//     if (!allowance) {
//       await setTokenAllowance($tempTx.yieldToken, contract.address);
//     }
//     let tx;
//     setPendingWallet();
//     tx = await contract.deposit($tempTx.yieldToken, amountToWei, $account.address, {
//       gasPrice: gas,
//     });
//     setPendingTx();
//     await provider.once(tx.hash, (transaction) => {
//       setSuccessTx(transaction.transactionHash);
//       refreshData({ token: $tempTx.yieldToken, vaultIndex: $tempTx.vaultIndex });
//     });
//   } catch (e) {
//     setError(e.data ? await e.data.message : e.message);
//     console.debug(e);
//   }
//   tempClear();
// };

import { VaultsType } from './alcxStore';
import { VaultTypes } from './types';
import { erc20Contract, contractWrapper } from '../../helpers/contractWrapper';
import { Signer, BigNumber, utils } from 'ethers';
import { VaultConstants } from './constants';
import { getUserGas } from '@helpers/getUserGas';
import { setPendingWallet, setPendingTx, setSuccessTx } from '@helpers/setToast';
import { fetchUpdateVaultByAddress } from './asyncMethods';

export async function deposit(
  tokenAddress: string,
  typeOfVault: VaultTypes,
  amountYield: BigNumber,
  [userAddressStore, signerStore]: [string, Signer],
) {
  const erc20Instance = erc20Contract(tokenAddress, signerStore);
  const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
    VaultConstants[typeOfVault].alchemistContractSelector,
    signerStore,
  );

  // The way you get the gas needs to be moved in a dependency property
  const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

  const allowance = await erc20Instance.allowanceOf(userAddressStore, alchemistAddress);

  if (BigNumber.from(allowance).lt(amountYield)) {
    // TODO: Add a toast when approving

    await erc20Instance.approve(alchemistAddress);
  }

  setPendingWallet();

  const tx = await alchemistInstance.deposit(tokenAddress, amountYield, userAddressStore, {
    gasPrice: gas,
  });

  setPendingTx();

  await signerStore.provider.once(tx.hash, async (transaction) => {
    setSuccessTx(transaction.transactionHash);
    // TODO: Rethink what parameters you pass
    await fetchUpdateVaultByAddress(typeOfVault, tokenAddress, [signerStore, userAddressStore]);
  });
}

export async function depositUnderlying() {}

export async function mint() {}

export async function burn() {}

export async function repay() {}

export async function withdraw() {}

export async function withdrawUnderlying() {}
