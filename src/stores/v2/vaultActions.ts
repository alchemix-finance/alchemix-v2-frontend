import { VaultTypes } from './types';
import { erc20Contract, contractWrapper } from '../../helpers/contractWrapper';
import { Signer, BigNumber, utils, ethers, ContractTransaction } from 'ethers';
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
  maximumLoss: BigNumber,
  [userAddressStore, signerStore]: [string, Signer],
  useGateway = false,
) {
  try {
    const erc20Instance = erc20Contract(underlyingAddress, signerStore);
    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

    const allowance = await erc20Instance.allowanceOf(userAddressStore, alchemistAddress);

    if (BigNumber.from(allowance).lt(amountYield)) {
      setPendingApproval();
      await erc20Instance.approve(alchemistAddress);
    }

    setPendingWallet();

    if (!useGateway) {
      const tx = (await alchemistInstance.depositUnderlying(
        tokenAddress,
        amountYield,
        userAddressStore,
        maximumLoss,
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
    } else {
      const { instance: gatewayInstance } = contractWrapper(
        VaultConstants[typeOfVault].gatewayContractSelector,
        signerStore,
      );
      const tx = (await gatewayInstance.depositUnderlying(
        alchemistAddress,
        tokenAddress,
        amountYield,
        userAddressStore,
        maximumLoss,
        {
          gasPrice: gas,
          value: amountYield,
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

    const depositUnderlying = alchemistInterface.encodeFunctionData('depositUnderlying', [
      yieldTokenAddress,
      amountUnderlying,
      userAddressStore,
      maximumLoss,
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

export async function withdrawUnderlying(
  typeOfVault: VaultTypes,
  yieldTokenAddress: string,
  underlyingTokenAddress: string,
  amountUnderlying: BigNumber,
  accountAddress: string,
  maximumLoss: BigNumber,
  [signerStore]: [Signer],
) {
  try {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    setPendingWallet();

    const tx = (await alchemistInstance.withdrawUnderlying(
      yieldTokenAddress,
      amountUnderlying,
      accountAddress,
      maximumLoss,
      {
        gasPrice: gas,
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
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/withdraw]: ${error}`);
    throw Error(error);
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
) {
  try {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const { instance: alchemistInstance, fragment: alchemistInterface } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    const encodedWithdrawUnderlyingFunc = alchemistInterface.encodeFunctionData('withdrawUnderlying', [
      yieldTokenAddress,
      underlyingAmount,
      accountAddress,
      maximumLoss,
    ]);

    const encodedWithdrawFunc = alchemistInterface.encodeFunctionData('withdraw', [
      yieldTokenAddress,
      yieldAmount,
      accountAddress,
    ]);

    const txPackage = [encodedWithdrawUnderlyingFunc, encodedWithdrawFunc];

    setPendingWallet();

    const tx = (await alchemistInstance.multicall(txPackage, {
      gasPrice: gas,
    })) as ContractTransaction;

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

    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

    const tx = (await alchemistInstance.mint(amountToBorrow, userAddress, {
      gasPrice: gas,
    })) as ContractTransaction;

    console.log('not finished tx:', tx);

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      console.log('finished tx:', tx);

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
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const underlyingTokenInstance = erc20Contract(debtToken, signerStore);

    const { instance: alchemistInstance, address: alchemistAddress } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    const burnAllowanceAmount = await underlyingTokenInstance.allowanceOf(addressStore, alchemistAddress);
    setPendingWallet();
    if (amountToBurn.gt(burnAllowanceAmount)) {
      await underlyingTokenInstance.approve(alchemistAddress);
    }

    const tx = (await alchemistInstance.burn(amountToBurn, addressStore, {
      gasPrice: gas,
    })) as ContractTransaction;

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
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    setPendingWallet();

    const tx = (await alchemistInstance.repay(debtToken, amountToRepay, addressStore, {
      gasPrice: gas,
    })) as ContractTransaction;

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
) {
  try {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
    );

    setPendingWallet();

    const tx = (await alchemistInstance.liquidate(yieldToken, amountToRepay, maximumLoss, {
      gasPrice: gas,
    })) as ContractTransaction;

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
