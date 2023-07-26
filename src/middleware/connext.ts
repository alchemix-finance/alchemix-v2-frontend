import { create, SdkConfig } from '@connext/sdk';
import { chainIds } from '@stores/v2/constants';
import { utils, Signer } from 'ethers';
import { contractWrapper } from '@helpers/contractWrapper';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';

const abiCoder = new utils.AbiCoder();

const getRpcByConnextId = (id: number) => {
  return chainIds.filter((entry) => entry.connextId === id)[0].apiUrl;
};

export const relayerFee = async (origin: number, destination: number, userAddress: string) => {
  const sdkConfig: SdkConfig = {
    signerAddress: userAddress,
    network: 'mainnet',
    chains: {
      6648936: {
        providers: [getRpcByConnextId(6648936)],
      },
      1634886255: {
        providers: [getRpcByConnextId(1634886255)],
      },
      1869640809: {
        providers: [getRpcByConnextId(1869640809)],
      },
    },
  };
  const { sdkBase } = await create(sdkConfig);
  const fee = await sdkBase.estimateRelayerFee({
    originDomain: origin.toString(),
    destinationDomain: destination.toString(),
  });
  return fee.toString();
};

export const xcall = async (
  origin: string,
  destination: string,
  asset: string,
  amount: string,
  signer: Signer,
  userAddress: string,
  path: string,
  infiniteApproval: boolean,
  relayerFee: string,
) => {
  setPendingWallet();
  try {
    const sdkConfig: SdkConfig = {
      signerAddress: userAddress,
      network: 'mainnet',
      chains: {
        6648936: {
          providers: [getRpcByConnextId(6648936)],
        },
        1634886255: {
          providers: [getRpcByConnextId(1634886255)],
        },
        1869640809: {
          providers: [getRpcByConnextId(1869640809)],
        },
      },
    };
    const { sdkBase } = await create(sdkConfig);

    const { address: gatewayAddress } = await contractWrapper('AlchemixConnextGateway', signer, path);

    const xcallParams = {
      origin: origin,
      destination: destination,
      asset: asset,
      amount: amount,
      to: gatewayAddress,
      callData: abiCoder.encode(['address'], [userAddress]),
      relayerFee: relayerFee,
    };

    const xcallApproval = await sdkBase.approveIfNeeded(origin, asset, amount, infiniteApproval);

    if (xcallApproval) {
      setPendingApproval();
      const approveReceipt = await signer.sendTransaction(xcallApproval);
      await approveReceipt.wait();
    }
    setPendingTx();
    const xcallRequest = await sdkBase.xcall(xcallParams);
    const xcallReceipt = await signer.sendTransaction(xcallRequest);
    return await xcallReceipt.wait().then((transaction) => {
      setSuccessTx(transaction);
      return transaction;
    });
  } catch (e) {
    setError(e.data ? await e.data.originalError.message : e.message, e);
    console.error(`[xcall]: ${e}`);
    throw Error(e);
  }
};
