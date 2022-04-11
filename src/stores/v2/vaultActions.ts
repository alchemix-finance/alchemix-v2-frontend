import { VaultTypes } from './types';
import { erc20Contract, contractWrapper } from '@helpers/contractWrapper';
import { Signer, BigNumber, ethers, ContractTransaction } from 'ethers';
import { VaultConstants } from './constants';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';

export async function getDepositRemainder(
  _yieldTokenAddress: string,
  _vaultType: VaultTypes,
  _adapterPrice: BigNumber,
  [_signer]: [Signer],
) {
  try {
    const { instance: alchemist } = contractWrapper(
      VaultConstants[_vaultType].alchemistContractSelector,
      _signer,
    );
    const yieldTokenParameters = await alchemist.getYieldTokenParameters(_yieldTokenAddress);
    const depositCap = yieldTokenParameters.maximumExpectedValue;
    const activeBalance = yieldTokenParameters.activeBalance;
    const harvestableBalance = yieldTokenParameters.harvestableBalance;
    const decimals = yieldTokenParameters.decimals;
    return depositCap.sub(
      _adapterPrice.mul(activeBalance.add(harvestableBalance)).div(BigNumber.from(10).pow(decimals)),
    );
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/getDepositRemainder]: ${error}`);
    throw Error(error);
  }
}

export function limitChecker(
  _deposit: BigNumber,
  _depositLimit: BigNumber,
  _activeBalance: BigNumber,
  _harvestableBalance: BigNumber,
  _adapterPrice: BigNumber,
  _decimals: number,
) {
  const cValue = _adapterPrice
    .mul(_activeBalance.add(_harvestableBalance))
    .div(BigNumber.from(10).pow(_decimals));
  if (_deposit.gt(_depositLimit.sub(cValue))) throw Error('Amount exceeds vault deposit limits');
}

export async function deposit(
  tokenAddress: string,
  typeOfVault: VaultTypes,
  amountYield: BigNumber,
  adapterPrice: BigNumber,
  decimals: number,
  [userAddressStore, signerStore]: [string, Signer],
) {
  try {
    const erc20Instance = erc20Contract(tokenAddress, signerStore);
    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    const allowance = await erc20Instance.allowanceOf(userAddressStore, alchemistAddress);
    const tokenParameters = await alchemistInstance.getYieldTokenParameters(tokenAddress);
    const depositLimit = tokenParameters.maximumExpectedValue;
    const activeBalance = tokenParameters.activeBalance;
    const harvestableBalance = tokenParameters.harvestableBalance;

    limitChecker(amountYield, depositLimit, activeBalance, harvestableBalance, adapterPrice, decimals);

    if (BigNumber.from(allowance).lt(amountYield)) {
      setPendingApproval();
      const sendApe = (await erc20Instance.approve(alchemistAddress)) as ethers.ContractTransaction;
      await sendApe.wait();
    }

    setPendingWallet();

    const tx = (await alchemistInstance.deposit(
      tokenAddress,
      amountYield,
      userAddressStore,
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
    console.error(`[vaultActions/deposit]: ${error}`);
    throw Error(error);
  }
}

export async function depositUnderlying(
  underlyingAddress: string,
  tokenAddress: string,
  typeOfVault: VaultTypes,
  amountUnderlying: BigNumber,
  amountYield: BigNumber,
  maximumLoss: BigNumber,
  adapterPrice: BigNumber,
  decimals: number,
  [userAddressStore, signerStore]: [string, Signer],
  minimumAmountOut: BigNumber,
  useGateway = false,
) {
  try {
    const erc20Instance = erc20Contract(underlyingAddress, signerStore);
    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    const allowance = await erc20Instance.allowanceOf(userAddressStore, alchemistAddress);
    const tokenParameters = await alchemistInstance.getYieldTokenParameters(tokenAddress);
    const depositLimit = tokenParameters.maximumExpectedValue;
    const activeBalance = tokenParameters.activeBalance;
    const harvestableBalance = tokenParameters.harvestableBalance;

    limitChecker(amountYield, depositLimit, activeBalance, harvestableBalance, adapterPrice, decimals);

    if (!useGateway) {
      if (BigNumber.from(allowance).lt(amountUnderlying)) {
        setPendingApproval();
        const sendApe = (await erc20Instance.approve(alchemistAddress)) as ethers.ContractTransaction;
        await sendApe.wait();
      }

      setPendingWallet();
      const tx = (await alchemistInstance.depositUnderlying(
        tokenAddress,
        amountUnderlying,
        userAddressStore,
        minimumAmountOut,
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
    } else {
      const { instance: gatewayInstance } = contractWrapper(
        VaultConstants[typeOfVault].gatewayContractSelector,
        signerStore,
      );
      setPendingWallet();
      console.log(amountUnderlying.toString(), minimumAmountOut.toString());
      const tx = (await gatewayInstance.depositUnderlying(
        alchemistAddress,
        tokenAddress,
        amountUnderlying,
        userAddressStore,
        minimumAmountOut,
        {
          value: amountUnderlying,
          gasLimit: BigNumber.from(1000000),
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
    }
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
  maximumLoss: BigNumber,
  [userAddressStore, signerStore]: [string, Signer],
  minimumOut: BigNumber,
  underlyingToYield: BigNumber,
  adapterPrice: BigNumber,
  decimals: number,
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

    const tokenParameters = await alchemistInstance.getYieldTokenParameters(yieldTokenAddress);
    const depositLimit = tokenParameters.maximumExpectedValue;
    const activeBalance = tokenParameters.activeBalance;
    const harvestableBalance = tokenParameters.harvestableBalance;

    limitChecker(amountYield, depositLimit, activeBalance, harvestableBalance, adapterPrice, decimals);

    if (BigNumber.from(yieldTokenAllowance).lt(amountYield)) {
      setPendingApproval();
      const sendApe = (await yieldTokenInstance.approve(alchemistAddress)) as ethers.ContractTransaction;
      await sendApe.wait();
    }

    if (BigNumber.from(underlyingTokenAllowance).lt(amountUnderlying)) {
      setPendingApproval();
      const sendApe = (await underlyingTokenInstance.approve(alchemistAddress)) as ethers.ContractTransaction;
      await sendApe.wait();
    }

    const deposit = alchemistInterface.encodeFunctionData('deposit', [
      yieldTokenAddress,
      amountYield,
      userAddressStore,
    ]);

    const depositUnderlying = alchemistInterface.encodeFunctionData('depositUnderlying', [
      yieldTokenAddress,
      amountUnderlying,
      userAddressStore,
      minimumOut,
    ]);
    const dataPackage = [deposit, depositUnderlying];

    setPendingWallet();

    const tx = (await alchemistInstance.multicall(dataPackage)) as ethers.ContractTransaction;

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

export async function withdraw(
  typeOfVault: VaultTypes,
  yieldTokenAddress: string,
  yieldAmount: BigNumber,
  accountAddress: string,
  [signerStore]: [Signer],
) {
  try {
    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    setPendingWallet();
    const tx = (await alchemistInstance.withdraw(
      yieldTokenAddress,
      yieldAmount,
      accountAddress,
    )) as ethers.ContractTransaction;
    setPendingTx();

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

export async function withdrawUnderlying(
  typeOfVault: VaultTypes,
  yieldTokenAddress: string,
  underlyingTokenAddress: string,
  amountUnderlying: BigNumber,
  accountAddress: string,
  maximumLoss: BigNumber,
  [signerStore]: [Signer],
  minimumAmountOut: BigNumber,
  useGateway = false,
) {
  try {
    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    if (!useGateway) {
      setPendingWallet();
      const tx = (await alchemistInstance.withdrawUnderlying(
        yieldTokenAddress,
        amountUnderlying,
        accountAddress,
        minimumAmountOut,
      )) as ethers.ContractTransaction;

      setPendingTx();
      return await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);

        return {
          typeOfVault,
          yieldTokenAddress,
          underlyingTokenAddress,
        };
      });
    } else {
      const { instance: gatewayInstance, address: gatewayAddress } = contractWrapper(
        VaultConstants[typeOfVault].gatewayContractSelector,
        signerStore,
      );
      // check withdrawAllowance on alchemist
      // if insufficient, call approveWithdraw for amount on alchemist with spender gateway

      const withdrawApproval = await alchemistInstance.withdrawAllowance(
        accountAddress,
        gatewayAddress,
        yieldTokenAddress,
      );
      const canWithdraw = withdrawApproval.gte(amountUnderlying);

      if (!canWithdraw) {
        setPendingApproval();
        await alchemistInstance.approveWithdraw(gatewayAddress, yieldTokenAddress, amountUnderlying);
      }
      setPendingWallet();

      const tx = (await gatewayInstance.withdrawUnderlying(
        alchemistAddress,
        yieldTokenAddress,
        amountUnderlying,
        accountAddress,
        minimumAmountOut,
        {
          gasLimit: BigNumber.from(1000000),
        },
      )) as ethers.ContractTransaction;

      setPendingTx();

      return await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);

        return {
          typeOfVault,
          yieldTokenAddress,
          underlyingTokenAddress,
        };
      });
    }
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.trace(`[vaultActions/withdraw]: ${error}`);
    throw Error(error.data);
  }
}

export async function multicallWithdraw(
  yieldTokenAddress: string,
  underlyingTokenAddress: string,
  yieldAmount: BigNumber,
  underlyingAmount: BigNumber,
  typeOfVault: VaultTypes,
  accountAddress: string,
  maximumLoss: BigNumber,
  [signerStore]: [Signer],
  minimumAmountOut: BigNumber,
) {
  try {
    const { instance: alchemistInstance, fragment: alchemistInterface } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    const encodedWithdrawUnderlyingFunc = alchemistInterface.encodeFunctionData('withdrawUnderlying', [
      yieldTokenAddress,
      underlyingAmount,
      accountAddress,
      minimumAmountOut,
    ]);

    const encodedWithdrawFunc = alchemistInterface.encodeFunctionData('withdraw', [
      yieldTokenAddress,
      yieldAmount,
      accountAddress,
    ]);

    const txPackage = [encodedWithdrawUnderlyingFunc, encodedWithdrawFunc];

    setPendingWallet();

    const tx = (await alchemistInstance.multicall(txPackage)) as ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        yieldTokenAddress,
        underlyingTokenAddress,
        typeOfVault,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/multicallWithdraw]: ${error}`);
    throw Error(error);
  }
}

export async function mint(
  amountToBorrow: BigNumber,
  userAddress: string,
  typeOfVault: VaultTypes,
  [signerStore]: [Signer],
) {
  try {
    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    setPendingWallet();
    const tx = (await alchemistInstance.mint(amountToBorrow, userAddress)) as ContractTransaction;
    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        typeOfVault,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/mint]:`, error);
    throw Error(error);
  }
}

export async function burn(
  debtToken: string,
  amountToBurn: BigNumber,
  typeOfVault: VaultTypes,
  [signerStore, addressStore]: [Signer, string],
) {
  try {
    const underlyingTokenInstance = erc20Contract(debtToken, signerStore);

    const { instance: alchemistInstance, address: alchemistAddress } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    const burnAllowanceAmount = await underlyingTokenInstance.allowanceOf(addressStore, alchemistAddress);
    setPendingWallet();
    if (amountToBurn.gt(burnAllowanceAmount)) {
      const sendApe = (await underlyingTokenInstance.approve(alchemistAddress)) as ethers.ContractTransaction;
      await sendApe.wait();
    }

    const tx = (await alchemistInstance.burn(amountToBurn, addressStore)) as ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        debtToken,
        typeOfVault,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/burn]: ${error}`);
    throw Error(error);
  }
}

export async function repay(
  debtToken: string,
  amountToRepay: BigNumber,
  typeOfVault: VaultTypes,
  [signerStore, addressStore]: [Signer, string],
) {
  try {
    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    setPendingWallet();

    const tx = (await alchemistInstance.repay(debtToken, amountToRepay, addressStore)) as ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        debtToken,
        typeOfVault,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/repay]: ${error}`);
    throw Error(error);
  }
}

export async function liquidate(
  yieldToken: string,
  amountToRepay: BigNumber,
  typeOfVault: VaultTypes,
  maximumLoss: BigNumber,
  [signerStore]: [Signer],
  minimumAmountOut: BigNumber,
) {
  try {
    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    setPendingWallet();

    const tx = (await alchemistInstance.liquidate(
      yieldToken,
      amountToRepay,
      minimumAmountOut,
    )) as ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        yieldToken,
        typeOfVault,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/liquidate]: ${error}`);
    throw Error(error);
  }
}
