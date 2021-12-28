<script>
import Button from '../../../elements/Button.svelte';
import Deposit from '../../../composed/Modals/vaults/Deposit.svelte';
import { getContext } from 'svelte';
import { modalStyle } from '../../../../stores/modal';

export let yieldToken;
export let underlyingToken;
export let loanRatio;
export let userDeposit;
export let borrowLimit;

const { open } = getContext('simple-modal');

const openDeposit = () => {
  open(
    Deposit,
    { yieldToken, underlyingToken },
    { ...modalStyle },
    {
      onClosed: () => {
        console.log('modal closed');
      },
    },
  );
};
</script>

<div class="flex justify-between space-x-2">
  <Button
    label="Deposit"
    borderColor="green4"
    backgroundColor="black1"
    hoverColor="green4"
    on:clicked="{openDeposit}"
  />

  <Button label="Withdraw" borderColor="red4" backgroundColor="red2" hoverColor="red4" solid="{false}" />
</div>
