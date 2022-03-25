import { VaultTypes } from './types';
import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
import { Signer, ethers, BigNumber, ContractTransaction } from 'ethers';
import { VaultConstants } from './constants';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setError,
  setPendingApproval,
} from '@helpers/setToast';

export async function liquidateLegacy(
  _vaultType: VaultTypes,
  [userAddressStore, signerStore]: [string, Signer],
) {
  try {
    const amount = ethers.constants.MaxUint256;
    const { instance: alchemistInstance } = contractWrapper(VaultConstants[_vaultType].legacy, signerStore);
    const debt = await alchemistInstance.getCdpTotalDebt(userAddressStore);
    if (debt.gt(BigNumber.from(0))) {
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
        1: [deposit.sub(debtDust.mul(4)), false],
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
  [userAddressStore, signerStore]: [string, Signer],
) {
  const collateralTotal = _collateralInitial.mul(_targetLTV).div(_slippage);
  const targetDebt = collateralTotal.sub(_collateralInitial);
  const paramLookup = Object.freeze({
    0: {
      pool: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
      poolInputIndex: '0',
      poolOutputIndex: '1',
      yieldToken: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
      underlyingToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      abi: 'AutoleverageCurveMetapool',
    },
    1: {
      pool: '0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e',
      poolInputIndex: '1',
      poolOutputIndex: '0',
      yieldToken: '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
      underlyingToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      abi: 'AutoleverageCurveFactoryethpool',
    },
  });
  const param = paramLookup[_vaultType];
  try {
    const underlyingTokenInstance = erc20Contract(param.underlyingToken, signerStore);
    const { instance: flashloanInstance, address: flashloanAddress } = contractWrapper(
      param.abi,
      signerStore,
    );
    const { address: alchemistAddress } = contractWrapper(
      VaultConstants[_vaultType].alchemistContractSelector,
      signerStore,
    );
    const underlyingAllowance = await underlyingTokenInstance.allowanceOf(userAddressStore, flashloanAddress);
    if (BigNumber.from(underlyingAllowance).lt(collateralTotal)) {
      setPendingApproval();
      const sendApe = (await underlyingTokenInstance.approve(flashloanAddress)) as ContractTransaction;
      await sendApe.wait();
    }
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
      {
        gasLimit: BigNumber.from(500000),
      },
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
