import type { VaultTypes } from './types';
import { erc20Contract, contractWrapper } from '@helpers/contractWrapper';
import { Signer, BigNumber, ethers, ContractTransaction } from 'ethers';
import { VaultConstants, VaultTypesInfos, chainIds } from './constants';
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
    const { instance: alchemist } = await contractWrapper(
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
      percent: yieldTokenParameters.maximumExpectedValue.gt(BigNumber.from(0))
        ? BigNumber.from(10000)
            .mul(
              yieldTokenParameters.maximumExpectedValue
                .sub(yieldTokenParameters.expectedValue)
                .mul(BigNumber.from(100)),
            )
            .div(yieldTokenParameters.maximumExpectedValue.mul(BigNumber.from(100)))
        : BigNumber.from(10000),
    };
  } catch (error) {
    setError(error.error.data ? await error.error.data.originalError.message : error.error.message, error);
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
    const selector = VaultTypesInfos[typeOfVault].metaConfig[tokenAddress]?.gateway;
    const gatewayCheck = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector).map((item) => {
      return item.filter((entry) => {
        return entry === selector;
      })[0];
    });
    const gatewayIndexCheck = gatewayCheck.indexOf(selector);

    const { address: alchemistAddress, instance: alchemistInstance } = await contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );
    if (gatewayIndexCheck >= 0 && gatewayCheck[gatewayIndexCheck] !== undefined) {
      const staticInstance = erc20Contract(tokenAddress, signerStore);

      const { instance: gatewayInstance, address: gatewayAddress } = await contractWrapper(
        selector,
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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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

    const { address: alchemistAddress, instance: alchemistInstance } = await contractWrapper(
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
      const gatewayIndexCheck = Object.entries(
        Object.entries(VaultConstants[typeOfVault].gatewayContractSelector)[0][1],
      )
        .map((item) => item[1])
        .filter((entry) => Object.entries(entry)[0][1] === tokenAddress);

      let gateway;
      if (!!gatewayIndexCheck) {
        gateway = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector)[0][0];
      } else {
        gateway = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector)
          .map((gates) => {
            // @ts-ignore
            if (gates[1].indexOf(tokenAddress) >= 0) return gates[0];
          })
          .filter((gate) => !!gate)[0];
      }
      const { instance: gatewayInstance } = await contractWrapper(gateway, signerStore, path);
      console.log(gateway, gatewayInstance);
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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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
    } = await contractWrapper(VaultConstants[typeOfVault].alchemistContractSelector, signerStore, path);

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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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
    const selector = VaultTypesInfos[typeOfVault].metaConfig[yieldTokenAddress]?.gateway;
    const gatewayCheck = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector).map((item) => {
      return item.filter((entry) => {
        return entry === selector;
      })[0];
    });
    const gatewayIndexCheck = gatewayCheck.indexOf(selector);
    const { instance: alchemistInstance } = await contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );

    if (
      gatewayIndexCheck >= 0 &&
      gatewayCheck.filter((entry) => {
        return !!entry;
      })[0] !== undefined
    ) {
      const { instance: gatewayInstance, address: gatewayAddress } = await contractWrapper(
        selector,
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

      const tx = (await gatewayInstance.withdraw(staticToken, yieldAmount, accountAddress, {
        gasLimit: BigNumber.from(1500000),
      })) as ethers.ContractTransaction;

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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const { address: alchemistAddress, instance: alchemistInstance } = await contractWrapper(
      VaultConstants[typeOfVault].alchemistContractSelector,
      signerStore,
      path,
    );

    if (!useGateway) {
      const selector = VaultTypesInfos[typeOfVault].metaConfig[yieldTokenAddress]?.gateway;
      const pair =
        VaultConstants[typeOfVault].gatewayContractSelector[selector]?.filter(
          (item) => item.aToken === yieldTokenAddress,
        )[0] || undefined;
      const gatewayCheck = Object.entries(VaultConstants[typeOfVault].gatewayContractSelector).map((item) => {
        return item.filter((entry) => {
          return entry === selector;
        })[0];
      });
      const gatewayIndexCheck = gatewayCheck.indexOf(selector);

      const targetYieldToken =
        gatewayIndexCheck >= 0 && gatewayCheck[0] !== undefined ? pair.staticToken : yieldTokenAddress;

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
      const { instance: gatewayInstance, address: gatewayAddress } = await contractWrapper(
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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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

    const { instance: alchemistInstance, fragment: alchemistInterface } = await contractWrapper(
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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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
    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const { instance: alchemistInstance } = await contractWrapper(
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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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

    const { instance: alchemistInstance, address: alchemistAddress } = await contractWrapper(
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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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

    const { instance: alchemistInstance, address: alchemistAddress } = await contractWrapper(
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
    setError(error.data ? await error.data.originalError.message : error.message, error);
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

    const { instance: alchemistInstance, address: alchemistAddress } = await contractWrapper(
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
    setError(error.data ? await error.data.originalError.message : error.message, error);
    console.error(`[vaultActions/liquidate]: ${error}`);
    throw Error(error);
  }
}

export async function migrateVault(
  vaultType: number,
  baseVaultToken: string,
  targetVaultToken: string,
  shareAmount: BigNumber,
  minReturnShares: BigNumber,
  minReturnUnderlying: BigNumber,
  network: string,
  [signerStore, addressStore]: [Signer, string],
) {
  try {
    enum migrator {
      'VaultMigrationTool_USD',
      'VaultMigrationTool_ETH',
    }

    const path = chainIds.filter((chain) => chain.id === network)[0].abiPath;

    const { instance: alchemistInstance } = await contractWrapper(
      VaultConstants[vaultType].alchemistContractSelector,
      signerStore,
      path,
    );
    const { instance: migratorInstance, address: migratorAddress } = await contractWrapper(
      migrator[vaultType],
      signerStore,
      path,
    );
    const withdrawAllowance = await alchemistInstance.withdrawAllowance(
      addressStore,
      migratorAddress,
      baseVaultToken,
    );
    const mintAllowance = await alchemistInstance.mintAllowance(addressStore, migratorAddress);

    if (shareAmount.gt(withdrawAllowance)) {
      setPendingApproval();
      const sendApe = (await alchemistInstance.approveWithdraw(
        migratorAddress,
        baseVaultToken,
        shareAmount,
      )) as ContractTransaction;
      await sendApe.wait();
    }

    if (minReturnUnderlying.gt(mintAllowance)) {
      setPendingApproval();
      const sendApe = (await alchemistInstance.approveMint(
        migratorAddress,
        minReturnUnderlying,
      )) as ContractTransaction;
      await sendApe.wait();
    }

    setPendingWallet();
    let tx;
    await migratorInstance.estimateGas
      .migrateVaults(baseVaultToken, targetVaultToken, shareAmount, minReturnShares, minReturnUnderlying)
      .then(async () => {
        tx = (await migratorInstance.migrateVaults(
          baseVaultToken,
          targetVaultToken,
          shareAmount,
          minReturnShares,
          minReturnUnderlying,
        )) as ContractTransaction;
      })
      .catch(async () => {
        tx = (await migratorInstance.migrateVaults(
          baseVaultToken,
          targetVaultToken,
          shareAmount,
          minReturnShares,
          minReturnUnderlying,
          {
            gasLimit: '2323232',
          },
        )) as ContractTransaction;
      });

    setPendingTx();

    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return true;
    });
  } catch (error) {
    setError(error.data ? await error.data.originalError.message : error.message, error);
    console.error(`[vaultActions/migrateVault]: ${error}`);
    throw Error(error);
  }
}
