import { VaultTypes } from './types';
import { erc20Contract, contractWrapper } from '@helpers/contractWrapper';
import { Signer, BigNumber, ethers, ContractTransaction } from 'ethers';
import { VaultConstants, chainIds } from './constants';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';

export async function getVaultCapacity(
  _yieldTokenAddress: string,
  _vaultType: VaultTypes,
  [_signer]: [Signer],
  _network: string,
) {
  try {
    const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;
    const { instance: alchemist } = contractWrapper(
      VaultConstants[_vaultType].alchemistContractSelector,
      _signer,
      path,
    );
    const yieldTokenParameters = await alchemist.getYieldTokenParameters(_yieldTokenAddress);
    return {
      value: yieldTokenParameters.maximumExpectedValue.gte(yieldTokenParameters.expectedValue)
        ? yieldTokenParameters.maximumExpectedValue.sub(yieldTokenParameters.expectedValue)
        : BigNumber.from(0),
      limit: yieldTokenParameters.maximumExpectedValue,
      percent:
        yieldTokenParameters.maximumExpectedValue < yieldTokenParameters.expectedValue
          ? BigNumber.from(10000)
          : BigNumber.from(10000)
              .mul(
                yieldTokenParameters.maximumExpectedValue
                  .sub(yieldTokenParameters.expectedValue)
                  .mul(BigNumber.from(100)),
              )
              .div(yieldTokenParameters.maximumExpectedValue.mul(BigNumber.from(100))),
    };
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/getVaultCapacity]: ${error}`);
    throw Error(error);
  }
}

export async function limitChecker(
  _deposit: BigNumber,
  _yieldTokenAddress: string,
  _vaultType: VaultTypes,
  [_signer]: [Signer],
  _network: string,
) {
  await getVaultCapacity(_yieldTokenAddress, _vaultType, [_signer], _network).then((response) => {
    if (_deposit.gt(response.value)) throw Error('Amount exceeds vault deposit limits');
  });
}

export async function deposit(
  tokenAddress: string,
  typeOfVault: VaultTypes,
  amountYield: BigNumber,
  adapterPrice: BigNumber,
  decimals: number,
  [userAddressStore, signerStore]: [string, Signer],
  _network: string,
  staticToken?: string,
) {
  try {
    const erc20Instance = erc20Contract(tokenAddress, signerStore);
    const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;
    const gatewayIndexCheck = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector)
      .map((gates) => {
        if (gates[1].indexOf(tokenAddress) >= 0) return gates[0];
      })
      .filter((gate) => !!gate)[0];

    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );
    if (!!gatewayIndexCheck) {
      const staticInstance = erc20Contract(tokenAddress, signerStore);

      const { instance: gatewayInstance, address: gatewayAddress } = contractWrapper(
        gatewayIndexCheck,
        signerStore,
        path,
      );

      const allowance = await staticInstance.allowanceOf(userAddressStore, gatewayAddress);

      if (BigNumber.from(allowance).lt(amountYield)) {
        setPendingApproval();
        const sendApe = (await staticInstance.approve(gatewayAddress)) as ethers.ContractTransaction;
        await sendApe.wait();
      }

      setPendingWallet();

      const tx = (await gatewayInstance.deposit(
        staticToken,
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
    } else {
      const allowance = await erc20Instance.allowanceOf(userAddressStore, alchemistAddress);
      const yieldPerShare = await alchemistInstance.getYieldTokensPerShare(tokenAddress);
      const underlyingPerShare = await alchemistInstance.getUnderlyingTokensPerShare(tokenAddress);
      const amountUnderlying = amountYield.mul(underlyingPerShare).div(yieldPerShare);

      await limitChecker(amountUnderlying, tokenAddress, typeOfVault, [signerStore], _network);

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
    }
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
  network: string,
  gateway: string,
  useGateway = false,
) {
  try {
    const erc20Instance = erc20Contract(underlyingAddress, signerStore);
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );

    const allowance = await erc20Instance.allowanceOf(userAddressStore, alchemistAddress);

    await limitChecker(amountUnderlying, tokenAddress, typeOfVault, [signerStore], network);

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
      const gatewayIndexCheck = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector)
        .map((gates) => {
          if (gates[1].indexOf(gateway) >= 0) return gates[0];
        })
        .filter((gate) => !!gate)[0];

      const { instance: gatewayInstance } = contractWrapper(gatewayIndexCheck, signerStore, path);
      setPendingWallet();
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
    setError(error.data ? await error.data.data : error.message);
    console.error(`[vaultActions/depositUnderlying]: ${await error.data}`);
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
  network: string,
) {
  try {
    const yieldTokenInstance = erc20Contract(yieldTokenAddress, signerStore);
    const underlyingTokenInstance = erc20Contract(underlyingTokenAddress, signerStore);
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const {
      address: alchemistAddress,
      instance: alchemistInstance,
      fragment: alchemistInterface,
    } = contractWrapper(VaultConstants[typeOfVault].alchemistContractSelector, signerStore, path);

    const yieldTokenAllowance = await yieldTokenInstance.allowanceOf(userAddressStore, alchemistAddress);
    const underlyingTokenAllowance = await underlyingTokenInstance.allowanceOf(
      userAddressStore,
      alchemistAddress,
    );

    await limitChecker(amountUnderlying, yieldTokenAddress, typeOfVault, [signerStore], network);

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
  network: string,
  staticToken?: string,
) {
  try {
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;
    const gatewayIndexCheck = Object.entries(
      VaultConstants[typeOfVault].gatewayContractSelector,
    )[0][1].indexOf(yieldTokenAddress);
    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );

    if (gatewayIndexCheck >= 0) {
      const gateway = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector)[0][0];

      const { instance: gatewayInstance, address: gatewayAddress } = contractWrapper(
        gateway,
        signerStore,
        path,
      );

      const withdrawApproval = await alchemistInstance.withdrawAllowance(
        accountAddress,
        gatewayAddress,
        staticToken,
      );
      const canWithdraw = withdrawApproval.gte(yieldAmount);

      if (!canWithdraw) {
        setPendingApproval();
        const sendApe = (await alchemistInstance.approveWithdraw(
          gatewayAddress,
          staticToken,
          yieldAmount,
        )) as ContractTransaction;
        await sendApe.wait();
      }

      setPendingWallet();

      const tx = (await gatewayInstance.withdraw(
        staticToken,
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
    } else {
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
    }
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
  network: string,
  gateway: string,
  useGateway = false,
) {
  try {
    console.log(
      'vaultActions/withdrawUnderlying',
      yieldTokenAddress,
      underlyingTokenAddress,
      gateway,
      useGateway,
    );
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const { address: alchemistAddress, instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );

    if (!useGateway) {
      const gatewayIndexCheck = Object.entries(
        Object.entries(VaultConstants[typeOfVault].gatewayContractSelector)[0][1],
      )
        .map((item) => item[1])
        .filter((entry) => Object.entries(entry)[0][1] === yieldTokenAddress)[0];

      // @ts-ignore
      const targetYieldToken = !!gatewayIndexCheck ? gatewayIndexCheck.staticToken : yieldTokenAddress;

      setPendingWallet();

      const tx = (await alchemistInstance.withdrawUnderlying(
        targetYieldToken,
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
      const _gateway = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector)[0][0];
      const { instance: gatewayInstance, address: gatewayAddress } = contractWrapper(
        _gateway,
        signerStore,
        path,
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
  network: string,
) {
  try {
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const { instance: alchemistInstance, fragment: alchemistInterface } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
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
  network: string,
) {
  try {
    console.log(amountToBorrow.toString());
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
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
  network: string,
) {
  try {
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const underlyingTokenInstance = erc20Contract(debtToken, signerStore);

    const { instance: alchemistInstance, address: alchemistAddress } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
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
  network: string,
) {
  try {
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const underlyingTokenInstance = erc20Contract(debtToken, signerStore);

    const { instance: alchemistInstance, address: alchemistAddress } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );

    const allowanceAmount = await underlyingTokenInstance.allowanceOf(addressStore, alchemistAddress);
    setPendingWallet();
    if (amountToRepay.gt(allowanceAmount)) {
      const sendApe = (await underlyingTokenInstance.approve(alchemistAddress)) as ethers.ContractTransaction;
      await sendApe.wait();
    }

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
  [signerStore, addressStore]: [Signer, string],
  minimumAmountOut: BigNumber,
  network: string,
) {
  try {
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const yieldTokenInstance = erc20Contract(yieldToken, signerStore);

    const { instance: alchemistInstance, address: alchemistAddress } = contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );

    const allowanceAmount = await yieldTokenInstance.allowanceOf(addressStore, alchemistAddress);

    if (amountToRepay.gt(allowanceAmount)) {
      const sendApe = (await yieldTokenInstance.approve(alchemistAddress)) as ethers.ContractTransaction;
      await sendApe.wait();
    }
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

export async function migrateVault(
  baseVaultToken: string,
  targetVaultToken: string,
  shareAmount: BigNumber,
  minReturnShares: BigNumber,
  minReturnUnderlying: BigNumber,
  network: string,
  [signerStore]: [Signer],
) {
  console.log(baseVaultToken, targetVaultToken, shareAmount, minReturnShares, minReturnUnderlying);

  try {
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const { instance: migratorInstance } = contractWrapper('VaultMigrationTool_USD', signerStore, path);

    setPendingWallet();

    const tx = (await migratorInstance.migrateVaults(
      baseVaultToken,
      targetVaultToken,
      shareAmount,
      minReturnShares,
      minReturnUnderlying,
    )) as ContractTransaction;

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return true;
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[vaultActions/migrateVault]: ${error}`);
    throw Error(error);
  }
}
