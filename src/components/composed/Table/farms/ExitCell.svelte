<script>
  import getContract from '../../../../helpers/getContract';
  import Button from '../../../elements/Button.svelte';
  import getUserGas from '../../../../helpers/getUserGas';
  import { getProvider } from '../../../../helpers/walletManager';
  import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '../../../../helpers/setToast';

  export let poolId;

  const contract = getContract('StakingPools');
  const provider = getProvider();

  const exitPool = async () => {
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

<Button
  borderColor="red4"
  backgroundColor="red2"
  hoverColor="red3"
  label="Exit"
  solid="{false}"
  on:clicked="{() => exitPool()}"
/>
