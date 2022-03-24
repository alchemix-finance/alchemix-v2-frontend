import { VaultTypes } from './types';
import { contractWrapper } from '@helpers/contractWrapper';
import { Signer, ethers, utils, BigNumber, ContractTransaction } from 'ethers';
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
        return payload[_vaultType][0];
      });
    }
    return true;
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/withdrawLegacy]: ${error}`);
    throw Error(error);
  }
}

export async function flashloanDeposit(
  _vaultType: VaultTypes,
  _collateralInitial: BigNumber,
  _targetLTV: BigNumber,
  _slippage: BigNumber,
  [signerStore]: [Signer],
) {
  console.log(
    _vaultType,
    _collateralInitial.toString(),
    _targetLTV.toString(),
    _slippage.toString(),
    signerStore,
  );
  const collateralTotal = _collateralInitial.mul(utils.parseEther('1').div(_targetLTV));
  const targetDebt = collateralTotal.sub(_collateralInitial).mul(_slippage).div(1000);
  const paramLookup = Object.freeze({
    0: {
      pool: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
      poolInputIndex: '0',
      poolOutputIndex: '1',
      yieldToken: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
    },
    1: {
      pool: '0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e',
      poolInputIndex: '1',
      poolOutputIndex: '0',
      yieldToken: '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
    },
  });
  const param = paramLookup[_vaultType];
  try {
    const { instance: flashloanInstance } = contractWrapper('autoleverage', signerStore);
    const { address: alchemistAddress } = contractWrapper(
      VaultConstants[_vaultType].alchemistContractSelector,
      signerStore,
    );
    setPendingWallet();
    const tx = (await flashloanInstance.autoleverage(
      param.pool,
      param.poolInputIndex,
      param.poolOutputIndex,
      alchemistAddress,
      param.yieldToken,
      _collateralInitial,
      collateralTotal,
      targetDebt,
    )) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return true;
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/flashloanDeposit]: ${error}`);
    throw Error(error);
  }
}
