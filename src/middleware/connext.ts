import { create, SdkConfig } from '@connext/sdk';
import { chainIds } from '@stores/v2/constants';
import { utils, Signer } from 'ethers';
import { contractWrapper } from '@helpers/contractWrapper';

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
  const fee = await sdkBase.estimateRelayerFee({ originDomain: origin, destinationDomain: destination });
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
) => {
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
  };

  const xcallApproval = await sdkBase.approveIfNeeded(origin, asset, amount, infiniteApproval);

  if (xcallApproval) {
    const approveReceipt = await signer.sendTransaction(xcallApproval);
    await approveReceipt.wait();
  }

  const xcallRequest = await sdkBase.xcall(xcallParams);
  const xcallReceipt = await signer.sendTransaction(xcallRequest);
  await xcallReceipt.wait();
};
