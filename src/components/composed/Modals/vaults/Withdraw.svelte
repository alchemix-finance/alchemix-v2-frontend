<script>
import { onMount } from 'svelte';
import { utils, FixedNumber, BigNumber } from 'ethers';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import Button from '../../../elements/Button.svelte';
import tempTx from '../../../../stores/tempTx';
import walletBalance from '../../../../stores/walletBalance';

import InputNumber from '../../../elements/inputs/InputNumber.svelte';

// @dev any balance value submitted through props is of type BigNumber, denoted in wei
export let vaultIndex;
export let yieldToken;
export let underlyingToken;
export let loanRatio;
export let userShares;
export let borrowLimit;
export let openDebtAmount;
export let openDebtSymbol;
export let underlyingPricePerShare;
export let yieldPricePerShare;
export let yieldDecimals;
export let underlyingDecimals;

let withdrawEnabled = false;

let yieldSymbol;
let yieldToShare;
let yieldWithdrawAmount = 0;
let yieldWithdrawAmountShares;
let maxYieldWithdrawAmount;
let yieldExceeded = false;

let underlyingSymbol;
let underlyingToShare;
let underlyingWithdrawAmount = 0;
let underlyingWithdrawAmountShares;
let maxUnderlyingWithdrawAmount;
let underlyingExceeded = false;

let startingBalance;
let availableShares;
let remainingBalance;
let projectedDebtLimit;
let openDebtAmountWei;

let sharesWithdrawAmount;

/*
 * @param amount the String amount to transform into shares
 * @param decimals the Number of decimal places to use for calculations
 * @param sharePrice the BigNumber to use as price for calculations
 * @returns a BigNumber that represents the amount of shares
 * */
const toShares = (amount, decimals, sharePrice) => {
  const scalar = BigNumber.from(10).pow(decimals);
  return utils.parseUnits(amount, decimals).mul(scalar).div(sharePrice);
};

const initYield = () => {
  yieldSymbol = $walletBalance.tokens.find((token) => token.address === yieldToken).symbol;
  const scalar = BigNumber.from(10).pow(yieldDecimals);
  yieldToShare = userShares.mul(yieldPricePerShare).div(scalar);
  maxYieldWithdrawAmount = utils.formatUnits(yieldToShare, yieldDecimals);
};

const setMaxYield = () => {
  yieldWithdrawAmount = utils.formatUnits(yieldToShare, yieldDecimals);
  clearUnderlying();
};

const clearYield = () => {
  yieldWithdrawAmount = '';
};

const initUnderlying = () => {
  underlyingSymbol = $walletBalance.tokens.find((token) => token.address === underlyingToken).symbol;
  const scalar = BigNumber.from(10).pow(underlyingDecimals);
  underlyingToShare = userShares.mul(underlyingPricePerShare).div(scalar);
  maxUnderlyingWithdrawAmount = utils.formatUnits(underlyingToShare, underlyingDecimals);
  console.log(underlyingToShare);
};

const setMaxUnderlying = () => {
  underlyingWithdrawAmount = maxUnderlyingWithdrawAmount;
  clearYield();
};

const clearUnderlying = () => {
  underlyingWithdrawAmount = '';
};

const updateBalances = () => {
  if (underlyingWithdrawAmount) {
    underlyingWithdrawAmountShares = toShares(
      underlyingWithdrawAmount,
      underlyingDecimals,
      underlyingPricePerShare,
    );
    underlyingExceeded = underlyingWithdrawAmountShares.gt(underlyingToShare);
  }
  if (yieldWithdrawAmount) {
    yieldWithdrawAmountShares = toShares(yieldWithdrawAmount, yieldDecimals, yieldPricePerShare);
    yieldExceeded = yieldWithdrawAmountShares.gt(yieldToShare);
    console.log(yieldWithdrawAmountShares.toString(), yieldToShare.toString());
  }
};

const withdraw = () => {};

$: yieldWithdrawAmount, updateBalances();
$: underlyingWithdrawAmount, updateBalances();

onMount(() => {
  console.log('withdraw mounted with props', { ...$$props });
  startingBalance = utils.formatUnits(userShares, underlyingDecimals);
  remainingBalance = startingBalance;
  initUnderlying();
  initYield();
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
        <div class="flex bg-grey3 rounded border {yieldExceeded ? 'border-red3' : 'border-grey3'}">
          <div class="w-full">
            <InputNumber
              id="yieldInput"
              bind:value="{yieldWithdrawAmount}"
              placeholder="~0.00 {yieldSymbol}"
              class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {yieldExceeded
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
        <div class="flex bg-grey3 rounded border {underlyingExceeded ? 'border-red3' : 'border-grey3'}">
          <div class="w-full">
            <InputNumber
              id="underlyingInput"
              bind:value="{underlyingWithdrawAmount}"
              placeholder="~0.00 {underlyingSymbol}"
              class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {underlyingExceeded
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
