import { VaultTypes } from './types';
import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
import { Signer, BigNumber, ContractTransaction, utils } from 'ethers';
import { VaultConstants } from './constants';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setError,
  setPendingApproval,
} from '@helpers/setToast';

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

export async function limitCheck(_vaultType: VaultTypes, [userAddress, signer]: [string, Signer]) {
  try {
    const param = paramLookup[_vaultType];
    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[_vaultType].alchemistContractSelector,
      signer,
    );
    const { instance: legacyInstance } = contractWrapper(VaultConstants[_vaultType].legacy, signer);
    const openDebt = await legacyInstance.getCdpTotalDebt(userAddress);
    const interest = await legacyInstance.getCdpTotalCredit(userAddress);
    const yieldParams = await alchemistInstance.getYieldTokenParameters(param.yieldToken);
    const expectedValue = yieldParams.expectedValue;
    const mintLimit = await alchemistInstance.getMintLimitInfo();
    return { openDebt: openDebt.sub(utils.parseUnits('1', 'gwei')), interest, expectedValue, mintLimit };
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/limitCheck]: ${error}`);
    throw Error(error);
  }
}

async function mintLegacy(_vaultType: VaultTypes, _interest: BigNumber, [signer]: [Signer]) {
  try {
    const { instance: alchemistInstance } = contractWrapper(VaultConstants[_vaultType].legacy, signer);
    setPendingWallet();
    const tx = (await alchemistInstance.mint(_interest)) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash, false);
      return _interest;
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/mintLegacy]: ${error}`);
    throw Error(error);
  }
}

async function liquidateLegacy(_vaultType: VaultTypes, _debt: BigNumber, [signer]: [Signer]) {
  try {
    const { instance: alchemistInstance } = contractWrapper(VaultConstants[_vaultType].legacy, signer);
    setPendingWallet();
    const tx = (await alchemistInstance.liquidate(
      _debt.sub(utils.parseUnits('1', 'gwei')),
    )) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash, false);
      return true;
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/liquidateLegacy]: ${error}`);
    throw Error(error);
  }
}

export async function liquidateWrap(_vaultType: VaultTypes, [userAddress, signer]: [string, Signer]) {
  try {
    const { instance: alchemistInstance } = contractWrapper(VaultConstants[_vaultType].legacy, signer);
    const debt = await alchemistInstance.getCdpTotalDebt(userAddress);
    const interest = await alchemistInstance.getCdpTotalCredit(userAddress);
    let mintedInterest = BigNumber.from(0);

    if (interest.gt(BigNumber.from(0))) {
      await mintLegacy(_vaultType, interest, [signer]).then((minted) => {
        mintedInterest = minted;
      });
    }

    if (interest.sub(mintedInterest).eq(BigNumber.from(0)) && debt.gt(utils.parseUnits('1', 'gwei'))) {
      await liquidateLegacy(_vaultType, debt, [signer]);
    }

    return true;
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/liquidateWrap]: ${error}`);
    throw Error(error);
  }
}

export async function withdrawLegacy(_vaultType: VaultTypes, [userAddress, signer]: [string, Signer]) {
  try {
    const { instance: alchemistInstance } = contractWrapper(VaultConstants[_vaultType].legacy, signer);
    const debtDust = await alchemistInstance.getCdpTotalDebt(userAddress);
    const deposit = await alchemistInstance.getCdpTotalDeposited(userAddress);
    if (deposit.gt(0)) {
      const payload = {
        0: [deposit.sub(debtDust.mul(2))],
        1: [deposit.sub(debtDust.mul(4)), false],
      };
      const param = paramLookup[_vaultType];
      if (payload[_vaultType][0].gt(0)) {
        setPendingWallet();
        const tx = (await alchemistInstance.withdraw(...payload[_vaultType])) as ContractTransaction;
        setPendingTx();
        return await tx.wait().then((transaction) => {
          setSuccessTx(transaction.transactionHash);
          return {
            withdrawAmount: payload[_vaultType][0],
            underlyingToken: param.underlyingToken,
          };
        });
      }
      return true;
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
  [userAddress, signer]: [string, Signer],
) {
  const collateralTotal = _collateralInitial.div(BigNumber.from(100)).mul(_targetLTV).add(_collateralInitial);
  const targetDebt = collateralTotal.sub(_collateralInitial).mul(_slippage).div(BigNumber.from(100000));
  const param = paramLookup[_vaultType];
  try {
    const underlyingTokenInstance = erc20Contract(param.underlyingToken, signer);
    const { instance: flashloanInstance, address: flashloanAddress } = contractWrapper(param.abi, signer);
    const { instance: alchemistInstance, address: alchemistAddress } = contractWrapper(
      VaultConstants[_vaultType].alchemistContractSelector,
      signer,
    );
    const underlyingAllowance = await underlyingTokenInstance.allowanceOf(userAddress, flashloanAddress);
    if (BigNumber.from(underlyingAllowance).lt(collateralTotal)) {
      setPendingApproval();
      const sendApe = (await underlyingTokenInstance.approve(flashloanAddress)) as ContractTransaction;
      await sendApe.wait();
    }
    setPendingApproval();
    const sendApe = (await alchemistInstance.approveMint(
      flashloanAddress,
      targetDebt,
    )) as ContractTransaction;
    await sendApe.wait();
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
        gasLimit: BigNumber.from(3000000),
      },
    )) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return {
        underlyingToken: param.underlyingToken,
        alchemistAddress,
        vaultType: _vaultType,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[flashloanActions/flashloanDeposit]: ${error}`);
    throw Error(error);
  }
}
