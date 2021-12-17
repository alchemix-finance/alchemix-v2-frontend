<script>
import getContract from '../../../../helpers/getContract';
import Button from '../../../elements/Button.svelte';
import getUserGas from '../../../../helpers/getUserGas';
import toastConfig from '../../../../stores/toast';
import { getProvider } from '../../../../helpers/walletManager';
import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '../../../../helpers/setToast';

export let poolId;

const provider = getProvider();

const exitPool = async () => {
  const contract = getContract('StakingPools');
  try {
    let tx;
    setPendingWallet();
    tx = await contract.exit(poolId, {
      gasPrice: getUserGas(),
    });
    setPendingTx();
    await provider.once(tx.hash, (transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (e) {
    setError(e.message);
    console.debug(e);
  }
};
</script>

<Button label="Exit" on:clicked="{() => exitPool()}" />
