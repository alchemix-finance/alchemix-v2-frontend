import { contractWrapper } from '@helpers/contractWrapper';
import { Signer, ContractTransaction } from 'ethers';
import { VaultTypes } from './types';
import { VaultConstants, TransmuterConstants } from './constants';
import { setPendingWallet, setPendingTx, setError, setSuccessTx } from '@helpers/setToast';
import { getAddress } from '@helpers/getContract';

export async function toggleTokenEnabled(
  vaultType: VaultTypes,
  tokenAddress: string,
  newState: boolean,
  [signerStore]: [Signer],
) {
  try {
    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[vaultType].alchemistContractSelector,
      signerStore,
    );
    const selector = (await alchemistInstance.isSupportedUnderlyingToken(tokenAddress))
      ? 'setUnderlyingTokenEnabled'
      : 'setYieldTokenEnabled';
    setPendingWallet();
    const tx = (await alchemistInstance[selector](tokenAddress, newState)) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        vaultType,
        tokenAddress,
        newState,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[sentinelActions/toggleTokenEnabled]: ${error}`);
    throw Error(error);
  }
}

export async function toggleTransmuterStatus(
  vaultType: VaultTypes,
  tokenName: string,
  state: boolean,
  [signerStore]: [Signer],
) {
  try {
    const transmuters = TransmuterConstants[vaultType].transmuterContractSelectors;
    const { instance: transmuterInstance } = contractWrapper(
      transmuters.find((selector) => selector.includes(tokenName)),
      signerStore,
    );
    setPendingWallet();
    const tx = (await transmuterInstance.setPause(state)) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        vaultType,
        tokenName,
        state,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[sentinelActions/toggleTransmuterStatus]: ${error}`);
    throw Error(error);
  }
}

export async function toggleAlchemistStatus(vaultType: VaultTypes, state: boolean, [signerStore]: [Signer]) {
  try {
    const targetAlchemist = getAddress(VaultConstants[VaultTypes[vaultType]].alchemistContractSelector);
    const { instance: alchemistInstance } = contractWrapper(
      VaultConstants[VaultTypes[vaultType]].alToken,
      signerStore,
    );
    setPendingWallet();
    const tx = (await alchemistInstance.pauseAlchemist(targetAlchemist, state)) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);

      return {
        vaultType,
        state,
      };
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[sentinelActions/toggleAlchemist]: ${error}`);
    throw Error(error);
  }
}
