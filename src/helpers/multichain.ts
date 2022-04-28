import { erc20Contract, contractWrapper } from '@helpers/contractWrapper';
import { BigNumber, Signer, ContractTransaction } from 'ethers';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';
import { chainIds } from '@stores/v2/constants';

export async function bridge(
  _txData: object,
  _token: string,
  _amount: BigNumber,
  _approvalTarget: string,
  [_userAddress, _signer]: [string, Signer],
) {
  try {
    const erc20instance = erc20Contract(_token, _signer);
    const allowance = await erc20instance.allowanceOf(_userAddress, _approvalTarget);

    if (BigNumber.from(allowance).lt(_amount)) {
      setPendingApproval();
      const sendApe = (await erc20instance.approve(_approvalTarget, _amount)) as ContractTransaction;
      await sendApe.wait();
    }
    setPendingWallet();
    const tx = (await _signer.sendTransaction(_txData)) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return transaction.transactionHash;
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[bridge]: ${error}`);
    throw Error(error);
  }
}

export async function toCanonical(
  _bridgeToken: string,
  _canonicalContract: string,
  _network: number,
  [_userAddress, _signer]: [string, Signer],
) {
  console.log(_bridgeToken, _canonicalContract, _network);
  try {
    const path = chainIds.filter((chain) => chain.legacyId === _network)[0].abiPath;
    const bridgeTokenInstance = erc20Contract(_bridgeToken, _signer);
    const bridgeBalance = await bridgeTokenInstance.balanceOf(_userAddress);
    console.log(bridgeBalance.toString());
    const { instance: canonicalInstance, address: canonicalAddress } = contractWrapper(
      _canonicalContract,
      _signer,
      path,
    );
    setPendingApproval();
    const sendApe = (await bridgeTokenInstance.approve(
      canonicalAddress,
      bridgeBalance,
    )) as ContractTransaction;
    await sendApe.wait();
    setPendingWallet();
    const tx = (await canonicalInstance.exchangeOldForCanonical(
      _bridgeToken,
      bridgeBalance,
    )) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction.transactionHash);
      return transaction.transactionHash;
    });
  } catch (error) {
    setError(error.data ? await error.data.message : error.message);
    console.error(`[toCanonical]: ${error}`);
    throw Error(error);
  }
}
