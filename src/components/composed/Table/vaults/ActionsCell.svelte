<script>
import Button from '../../../elements/Button.svelte';
import Deposit from '../../../composed/Modals/vaults/Deposit.svelte';
import Withdraw from '../../../composed/Modals/vaults/Withdraw.svelte';
import { getContext } from 'svelte';
import { modalStyle } from '../../../../stores/modal';

export let yieldToken;
export let underlyingToken;
export let loanRatio;
export let userDeposit;
export let borrowLimit;
export let openDebtAmount;
export let openDebtSymbol;
export let underlyingPricePerShare;
export let yieldPricePerShare;
export let yieldDecimals;
export let underlyingDecimals;
export let vaultIndex;

const { open } = getContext('simple-modal');

const openDeposit = () => {
  open(
    Deposit,
    { yieldToken, underlyingToken, loanRatio, userDeposit, borrowLimit, vaultIndex },
    { ...modalStyle },
    {
      onClosed: () => {
        console.log('modal closed');
      },
    },
  );
};

const openWithdraw = () => {
  open(
    Withdraw,
    {
      yieldToken,
      underlyingToken,
      loanRatio,
      borrowLimit,
      userShares: userDeposit,
      openDebtAmount,
      openDebtSymbol,
      underlyingPricePerShare,
      yieldPricePerShare,
      yieldDecimals,
      underlyingDecimals,
      vaultIndex,
    },
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

  <Button
    label="Withdraw"
    borderColor="red4"
    backgroundColor="red2"
    hoverColor="red4"
    solid="{false}"
    on:clicked="{openWithdraw}"
  />
</div>
