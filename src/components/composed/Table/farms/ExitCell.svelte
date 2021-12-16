<script>
import getContract from '../../../../helpers/getContract';
import Button from '../../../elements/Button.svelte';
import { BigNumber } from 'ethers';
import getUserGas from '../../../../helpers/getUserGas';

export let poolId;

const exitPool = async () => {
  const contract = getContract('StakingPools');
  try {
    const tx = await contract.exit(poolId, {
      gasPrice: getUserGas(),
    });
    console.log(BigNumber.from(tx.gasPrice).toString());
    console.log(BigNumber.from(tx.gasLimit).toString());
    console.table(tx);
  } catch (e) {
    console.log(e);
  }
};
</script>

<Button label="Exit" on:clicked="{() => exitPool()}" />
