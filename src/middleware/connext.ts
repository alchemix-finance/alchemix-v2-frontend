import { create, SdkConfig } from '@connext/sdk';
import { chainIds } from '@stores/v2/constants';
import { utils, Signer, BigNumber } from 'ethers';
import type { ContractTransaction } from 'ethers';
import { contractWrapper } from '@helpers/contractWrapper';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setPendingApproval,
  setError,
} from '@helpers/setToast';
import axios from 'axios';

const abiCoder = new utils.AbiCoder();
const subgraph = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/connext/amarok-runtime-v0-mainnet',
  optimism: 'https://api.thegraph.com/subgraphs/name/connext/amarok-runtime-v0-optimism',
  arbitrum: 'https://api.thegraph.com/subgraphs/name/connext/amarok-runtime-v0-arbitrum-one',
};

const killRequest = (timeout: number) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout || 0);
  return controller.signal;
};

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

export const statusCheck = async (txHash: string, origin: string, destination: string) => {
  const originData = await axios.post(subgraph[origin], {
    signal: killRequest(4000),
    query: `{originTransfers(
    where: {
      transactionHash: "${txHash}"
    }
  ) {
    status
    transferId
  }}`,
  });
  const txId = originData.data.data.originTransfers[0].transferId;
  const destinationData = await axios.post(subgraph[destination], {
    signal: killRequest(4000),
    query: `{destinationTransfers(
      where: {
        transferId: "${txId}"
          }) {
          status}}`,
  });
  console.log(destinationData);
  return destinationData.data.data.destinationTransfers.length > 0
    ? destinationData.data.data.destinationTransfers[0].status
    : originData.data.data.originTransfers[0].status;
};

export const gatewayCall = async (
  origin: string,
  destinationId: number,
  amount: BigNumber,
  targetAddress: string,
  relayerFee: BigNumber,
  signer: Signer,
  selectors: object,
  callData: string,
  toEth: boolean,
  path: string,
) => {
  setPendingWallet();
  try {
    const { instance: gatewayInstance, address: gatewayAddress } = await contractWrapper(
      'AlchemixConnextGateway',
      signer,
      origin,
    );
    const { address: nextAssetAddress } = await contractWrapper(selectors['connext'], signer, origin);
    const { instance: canonicalInstance } = await contractWrapper(selectors['canonical'], signer, origin);
    let receiverAddress = targetAddress;
    if (toEth) {
      const { address: targetGateway } = await contractWrapper('AlchemixConnextGateway', signer, path);
      receiverAddress = targetGateway;
    }

    const allowance = await canonicalInstance.allowance(targetAddress, gatewayAddress);
    console.log(allowance.toString(), amount.toString());
    if (allowance.lt(amount)) {
      setPendingApproval();
      const sendApe = (await canonicalInstance.approve(gatewayAddress, amount)) as ContractTransaction;
      await sendApe.wait();
    }

    setPendingWallet();

    const tx = (await gatewayInstance.bridgeAssets(
      receiverAddress,
      nextAssetAddress,
      amount,
      destinationId,
      relayerFee,
      toEth ? abiCoder.encode(['string'], [callData]) : abiCoder.encode(['address'], [callData]),
    )) as ContractTransaction;
    setPendingTx();
    return await tx.wait().then((transaction) => {
      setSuccessTx(transaction);
      return transaction;
    });
  } catch (e) {
    const message = e.data ? await e.data.message : e.message;
    setError(message, e);
    console.error(`[gatewayCall]: ${e}`);
    throw Error(e);
  }
};

export const bumpFees = async (txId: string, fee: BigNumber, userAddress: string, signer: Signer) => {
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
    const bumpRequest = await sdkBase.bumpTransfer({
      relayerFee: fee.toString(),
      transferId: txId,
      asset: '',
      domainId: '',
    });
    const bumpReceipt = await signer.sendTransaction(bumpRequest);
    return await bumpReceipt.wait().then((transaction) => {
      setSuccessTx(transaction);
      return transaction;
    });
  } catch (e) {
    const message = e.data ? await e.data.message : e.message;
    setError(message, e);
    console.error(`[bumpFees]: ${e}`);
    throw Error(e);
  }
};
