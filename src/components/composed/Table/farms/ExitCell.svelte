<script>
  import { utils } from 'ethers';
  import getContract from '../../../../helpers/getContract';
  import Button from '../../../elements/Button.svelte';
  import getUserGas from '../../../../helpers/getUserGas';
  import { getProvider } from '@helpers/walletManager';
  import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '@helpers/setToast';
  import settings from '@stores/settings';

  export let poolId;

  const contract = getContract('StakingPools');
  const provider = getProvider();

  const exitPool = async () => {
    try {
      const gas = await getUserGas();
      const gasPrice = utils.parseUnits(gas.toString(), 'gwei');
      setPendingWallet();
      const tx = await contract.exit(poolId, {
        gasPrice,
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
  backgroundColor="{$settings.invertColors ? 'red5' : 'red2'}"
  hoverColor="red3"
  label="Exit"
  solid="{false}"
  on:clicked="{() => exitPool()}"
/>
