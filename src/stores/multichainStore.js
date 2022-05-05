import { writable } from 'svelte/store';

const localTxData = JSON.parse(localStorage.getItem('multichainPendingTx'));

const multichainPendingTx = writable(
  localTxData || {
    bridge: undefined,
    fromChain: undefined,
    toChain: undefined,
    txHash: undefined,
    bridgeToken: undefined,
    token: undefined,
  },
);

multichainPendingTx.subscribe((val) => {
  localStorage.setItem('multichainPendingTx', JSON.stringify(val));
});

export default multichainPendingTx;
