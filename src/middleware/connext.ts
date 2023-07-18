import { create, SdkConfig } from '@connext/sdk';
import { signer } from '@stores/v2/derived';
import { addressStore } from '@stores/v2/alcxStore';
import { chainIds } from '@stores/v2/constants';

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

export const relayerFee = async (origin, destination) => {
  const { sdkBase } = await create(sdkConfig);
  const fee = await sdkBase.estimateRelayerFee({ origin, destination });
  return fee.toString();
};

export const xcall = async (origin: string, destination: string, asset: string, amount: string) => {
  const { sdkBase } = await create(sdkConfig);

  const xcallParams = {
    origin: origin,
    destination: destination,
    asset: asset,
    amount: amount,
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
