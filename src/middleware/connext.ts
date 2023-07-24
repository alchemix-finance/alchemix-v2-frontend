import { create, SdkConfig } from '@connext/sdk';
import { signer } from '@stores/v2/derived';
import { addressStore } from '@stores/v2/alcxStore';
import { chainIds } from '@stores/v2/constants';
import { utils } from 'ethers';

const abiCoder = new utils.AbiCoder();

let _addressStore;
let _signer;

addressStore.subscribe((val) => {
  _addressStore = val;
});

signer.subscribe((val) => {
  _signer = val;
});

const getRpcByConnextId = (id: number) => {
  return chainIds.filter((entry) => entry.connextId === id)[0].apiUrl;
};

export const relayerFee = async (origin, destination) => {
  const sdkConfig: SdkConfig = {
    signerAddress: _addressStore.address,
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
  gateway: string,
) => {
  const sdkConfig: SdkConfig = {
    signerAddress: _addressStore.address,
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

  const xcallParams = {
    origin: origin,
    destination: destination,
    asset: asset,
    amount: amount,
    to: gateway,
    callData: abiCoder.encode(['address'], _addressStore.address),
  };

  const xcallApproval = await sdkBase.approveIfNeeded(origin, asset, amount);

  if (xcallApproval) {
    const approveReceipt = await _signer.sendTransaction(xcallApproval);
    await approveReceipt.wait();
  }

  const xcallRequest = await sdkBase.xcall(xcallParams);
  const xcallReceipt = await _signer.sendTransaction(xcallRequest);
  console.log(xcallReceipt);
  await xcallReceipt.wait();
};
