<script>
  import getContract from '../../../../helpers/getContract';
  import Button from '../../../elements/Button.svelte';
  import getUserGas from '../../../../helpers/getUserGas';
  import { getProvider } from '../../../../helpers/walletManager';
  import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '../../../../helpers/setToast';
  import { contractWrapper } from '@helpers/contractWrapper';
  import { signer } from '@stores/v2/derived';

  export let poolId;

  const { instance } = contractWrapper('StakingPools', $signer);

  const exitPool = async () => {
    try {
      setPendingWallet();
      const tx = await instance.exit(poolId, {
        gasPrice: getUserGas(),
      });
      setPendingTx();

      await tx.wait().then((transaction) => {
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
