import { contractWrapper } from '@helpers/contractWrapper';
import getUserGas from '@helpers/getUserGas';
import { Signer, utils, ContractTransaction } from 'ethers';
import { VaultTypes } from './types';
import { VaultConstants } from './constants';
import { setPendingWallet, setPendingTx, setError, setSuccessTx } from '@helpers/setToast';

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
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const selector = (await alchemistInstance.isSupportedUnderlyingToken(tokenAddress))
      ? 'setUnderlyingTokenEnabled'
      : 'setYieldTokenEnabled';
    setPendingWallet();
    const tx = (await alchemistInstance[selector](tokenAddress, newState, {
      gasPrice: gas,
    })) as ContractTransaction;
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
