import { VaultTypes } from './types';
import { contractWrapper } from '@helpers/contractWrapper';
import { Signer, ethers, utils, ContractTransaction } from 'ethers';
import { VaultConstants } from './constants';
import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '@helpers/setToast';

export async function liquidateLegacy(
  _vaultType: VaultTypes,
  [userAddressStore, signerStore]: [string, Signer],
) {
  try {
    const amount = ethers.constants.MaxUint256;
    const { instance: alchemistInstance } = contractWrapper(VaultConstants[_vaultType].legacy, signerStore);
    const debt = await alchemistInstance.getCdpTotalDebt(userAddressStore);
    if (debt.gt(utils.parseUnits('1', 18))) {
      setPendingWallet();
      const tx = (await alchemistInstance.liquidate(amount)) as ContractTransaction;
      setPendingTx();
      return await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);
        return true;
      });
    }
    return true;
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/liquidateLegacy]: ${error}`);
    throw Error(error);
  }
}

export async function withdrawLegacy(
  _vaultType: VaultTypes,
  [userAddressStore, signerStore]: [string, Signer],
) {
  try {
    const { instance: alchemistInstance } = contractWrapper(VaultConstants[_vaultType].legacy, signerStore);
    const debtDust = await alchemistInstance.getCdpTotalDebt(userAddressStore);
    const deposit = await alchemistInstance.getCdpTotalDeposited(userAddressStore);
    if (deposit.gt(0)) {
      setPendingWallet();
      const payload = {
        0: [deposit.sub(debtDust.mul(2))],
        1: [deposit.sub(debtDust.mul(4)), true],
      };
      const tx = (await alchemistInstance.withdraw(...payload[_vaultType])) as ContractTransaction;
      setPendingTx();
      return await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);
        return true;
      });
    }
    return true;
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/withdrawLegacy]: ${error}`);
    throw Error(error);
  }
}
