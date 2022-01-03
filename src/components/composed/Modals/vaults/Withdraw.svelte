<script>
import { onMount } from 'svelte';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import Button from '../../../elements/Button.svelte';
import tempTx from '../../../../stores/tempTx';
import walletBalance from '../../../../stores/walletBalance';

export let yieldToken;
export let underlyingToken;
export let loanRatio;
export let userShares;
export let borrowLimit;
export let openDebtAmount;
export let openDebtSymbol;
export let underlyingPricePerShare;
export let yieldPricePerShare;

let yieldSymbol;
let yieldWithdraw;
let yieldToShare;
let maxYieldWithdrawAmount;

let underlyingSymbol;
let underlyingWithdraw;
let underlyingToShare;
let maxUnderlyingWithdrawAmount;

let startingBalance;
let remainingBalance;
let projectedDebtLimit;

let withdrawEnabled = false;

const initYield = () => {
  const shadowBalance = parseFloat(userShares) * parseFloat(yieldPricePerShare);
  const shadowDebt = openDebtAmount * parseFloat(underlyingPricePerShare);
  maxYieldWithdrawAmount = shadowBalance - shadowDebt * parseFloat(loanRatio);
  if (maxYieldWithdrawAmount < 0) maxYieldWithdrawAmount = 0;
};

const setMaxYield = () => {
  yieldWithdraw = maxYieldWithdrawAmount;
  underlyingWithdraw = null;
};

const clearYield = () => {
  yieldWithdraw = null;
};

const initUnderlying = () => {
  maxUnderlyingWithdrawAmount = startingBalance - openDebtAmount * parseFloat(loanRatio);
  if (maxUnderlyingWithdrawAmount < 0) maxUnderlyingWithdrawAmount = 0;
};

const setMaxUnderlying = () => {
  underlyingWithdraw = maxUnderlyingWithdrawAmount;
  yieldWithdraw = null;
};

const clearUnderlying = () => {
  underlyingWithdraw = null;
};

const updateBalances = () => {
  const normalizedYieldAmount =
    (yieldWithdraw / parseFloat(yieldPricePerShare)) * parseFloat(underlyingPricePerShare);
  console.log(normalizedYieldAmount, underlyingWithdraw);
  yieldToShare = normalizedYieldAmount / parseFloat(underlyingPricePerShare);
  underlyingToShare = underlyingWithdraw / parseFloat(underlyingPricePerShare);
  console.log(yieldToShare, underlyingToShare);
  remainingBalance = startingBalance - (normalizedYieldAmount || 0) - (underlyingWithdraw || 0);
  projectedDebtLimit = remainingBalance / parseFloat(loanRatio);
  withdrawEnabled =
    (yieldToShare > 0 && yieldWithdraw <= maxYieldWithdrawAmount) ||
    (underlyingToShare > 0 && underlyingWithdraw <= maxUnderlyingWithdrawAmount);
};

const withdraw = () => {
  let method;
  if (yieldToShare > 0 && underlyingToShare === 0) {
    method = 'withdraw';
  } else if (yieldToShare === 0 && underlyingToShare > 0) {
    method = 'withdrawUnderlying';
  } else {
    method = 'withdrawMulticall';
  }
  const payload = {
    amountYield: yieldToShare,
    amountUnderlying: underlyingToShare,
    amountBorrow: null,
    method,
    yieldToken,
    underlyingToken,
    targetAddress: null,
  };
  tempTx.set({ ...payload });
};

$: yieldWithdraw, updateBalances();
$: underlyingWithdraw, updateBalances();

onMount(() => {
  console.log('props', $$props);
  yieldSymbol = $walletBalance.tokens.find((token) => token.address === yieldToken).symbol;
  underlyingSymbol = $walletBalance.tokens.find((token) => token.address === underlyingToken).symbol;
  startingBalance = parseFloat(userShares) * parseFloat(underlyingPricePerShare);
  remainingBalance = startingBalance;
  projectedDebtLimit = borrowLimit;
  initYield();
  initUnderlying();
});
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex justify-between">
    <p class="inline-block">Withdraw Collateral</p>
    <div>
      {#if openDebtAmount !== '0.0'}
        <p class="inline-block">Debt: {openDebtAmount} {openDebtSymbol} |</p>
      {/if}
      <p class="inline-block">Loan Ratio: {100 / parseFloat(loanRatio)}%</p>
    </div>
  </div>
  <div slot="body" class="p-4">
    <div class="flex space-x-4">
      <div class="w-full">
        <label for="yieldInput" class="text-sm text-lightgrey10">
          Available: {maxYieldWithdrawAmount}
          {yieldSymbol}
        </label>
        <div
          class="flex bg-grey3 rounded border {yieldWithdraw > maxYieldWithdrawAmount
            ? 'border-red3'
            : 'border-grey3'}"
        >
          <div class="w-full">
            <input
              type="number"
              id="yieldInput"
              bind:value="{yieldWithdraw}"
              placeholder="~0.00 {yieldSymbol}"
              class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {yieldWithdraw >
              maxYieldWithdrawAmount
                ? 'text-red3'
                : 'text-lightgrey5'}"
            />
          </div>
          <div class="flex flex-col">
            <Button
              label="MAX"
              width="w-full"
              fontSize="text-xs"
              textColor="lightgrey10"
              backgroundColor="grey3"
              borderSize="0"
              height="h-10"
              on:clicked="{() => setMaxYield()}"
            />
            <Button
              label="CLEAR"
              width="w-max"
              fontSize="text-xs"
              textColor="lightgrey10"
              backgroundColor="grey3"
              borderSize="0"
              height="h-10"
              on:clicked="{() => clearYield()}"
            />
          </div>
        </div>
      </div>
      <div class="w-full">
        <label for="underlyingInput" class="text-sm text-lightgrey10">
          Available: {maxUnderlyingWithdrawAmount}
          {underlyingSymbol}
        </label>
        <div
          class="flex bg-grey3 rounded border {underlyingWithdraw > maxUnderlyingWithdrawAmount
            ? 'border-red3'
            : 'border-grey3'}"
        >
          <div class="w-full">
            <input
              type="number"
              id="underlyingInput"
              bind:value="{underlyingWithdraw}"
              placeholder="~0.00 {underlyingSymbol}"
              class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {underlyingWithdraw >
              maxUnderlyingWithdrawAmount
                ? 'text-red3'
                : 'text-lightgrey5'}"
            />
          </div>
          <div class="flex flex-col">
            <Button
              label="MAX"
              width="w-full"
              fontSize="text-xs"
              textColor="lightgrey10"
              backgroundColor="grey3"
              borderSize="0"
              height="h-10"
              on:clicked="{() => setMaxUnderlying()}"
            />
            <Button
              label="CLEAR"
              width="w-max"
              fontSize="text-xs"
              textColor="lightgrey10"
              backgroundColor="grey3"
              borderSize="0"
              height="h-10"
              on:clicked="{() => clearUnderlying()}"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="my-4 text-sm text-lightgrey10">
      Deposit Balance: {startingBalance}
      -> {remainingBalance}
      <br />
      Borrow Limit: {borrowLimit} -> {projectedDebtLimit}
    </div>

    <Button
      label="Withdraw"
      borderColor="red4"
      backgroundColor="red2"
      hoverColor="red4"
      height="h-12"
      borderSize="1"
      fontSize="text-md"
      solid="{withdrawEnabled}"
      on:clicked="{() => withdraw()}"
      disabled="{!withdrawEnabled}"
    />
  </div>
</ContainerWithHeader>
