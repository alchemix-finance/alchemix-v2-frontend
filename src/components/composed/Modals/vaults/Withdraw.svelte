<script>
import { onMount } from 'svelte';
import { utils, FixedNumber, BigNumber } from 'ethers';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import Button from '../../../elements/Button.svelte';
import tempTx from '../../../../stores/tempTx';
import walletBalance from '../../../../stores/walletBalance';

import InputNumber from '../../../elements/inputs/InputNumber.svelte';

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
let userSharesWei;

let withdrawEnabled = false;
let useMaxAmount = false;

const initYield = () => {
  const shadowBalance = userSharesWei * yieldPricePerShare;
  const shadowDebt = openDebtAmount * underlyingPricePerShare;
  maxYieldWithdrawAmount = utils.formatUnits((shadowBalance - shadowDebt).toString(), underlyingDecimals);
  if (maxYieldWithdrawAmount < 0) maxYieldWithdrawAmount = 0;
};

const setMaxYield = () => {
  yieldWithdraw = maxYieldWithdrawAmount;
  clearUnderlying();
};

const clearYield = () => {
  yieldWithdraw = '';
};

const initUnderlying = () => {
  maxUnderlyingWithdrawAmount = utils.formatUnits(
    (startingBalance - openDebtAmount).toString(),
    underlyingDecimals,
  );
  if (maxUnderlyingWithdrawAmount < 0) maxUnderlyingWithdrawAmount = 0;
};

const setMaxUnderlying = () => {
  underlyingWithdraw = maxUnderlyingWithdrawAmount;
  clearYield();
};

const clearUnderlying = () => {
  underlyingWithdraw = '';
};

const updateBalances = () => {
  const normalizedYieldAmount = ((yieldWithdraw || 0) / yieldPricePerShare) * underlyingPricePerShare;
  console.log('updateBalances', normalizedYieldAmount, underlyingWithdraw, maxUnderlyingWithdrawAmount);
  yieldToShare = normalizedYieldAmount / underlyingPricePerShare || 0;
  underlyingToShare =
    utils.parseUnits((underlyingWithdraw || 0).toString(), underlyingDecimals) / underlyingPricePerShare || 0;
  console.log(
    'values',
    startingBalance,
    normalizedYieldAmount,
    yieldToShare,
    underlyingWithdraw,
    underlyingToShare,
  );
  remainingBalance = utils.formatUnits(
    (startingBalance || 0) -
      utils.parseUnits((normalizedYieldAmount || 0).toString(), underlyingDecimals) -
      utils.parseUnits((underlyingWithdraw || 0).toString(), underlyingDecimals),
    underlyingDecimals,
  );
  projectedDebtLimit = remainingBalance / loanRatio;
  withdrawEnabled =
    (yieldToShare > 0 && yieldWithdraw <= maxYieldWithdrawAmount) ||
    (underlyingToShare > 0 && underlyingWithdraw <= maxUnderlyingWithdrawAmount);
};

const withdraw = () => {
  console.log('withdraw', yieldToShare.toString(), underlyingToShare.toString());
  let method;
  if (parseFloat(yieldToShare) > 0 && (parseFloat(underlyingToShare) === 0 || !!!underlyingToShare)) {
    method = 'withdraw';
  } else if ((parseFloat(yieldToShare) === 0 || !!!yieldToShare) && parseFloat(underlyingToShare) > 0) {
    method = 'withdrawUnderlying';
  } else {
    method = 'withdrawMulticall';
  }
  console.log('method', method);
  const payload = {
    amountYield: utils.parseUnits(yieldToShare.toString(), yieldDecimals),
    amountUnderlying: underlyingToShare.toString(),
    amountBorrow: null,
    amountRepay: null,
    method,
    yieldToken,
    underlyingToken,
    targetAddress: null,
    vaultIndex,
  };
  console.log(payload);
  console.log(underlyingToShare, payload.amountUnderlying.toString());
  tempTx.set({ ...payload });
};

$: yieldWithdraw, updateBalances();
$: underlyingWithdraw, updateBalances();

onMount(() => {
  yieldSymbol = $walletBalance.tokens.find((token) => token.address === yieldToken).symbol;
  underlyingSymbol = $walletBalance.tokens.find((token) => token.address === underlyingToken).symbol;
  remainingBalance = startingBalance;
  projectedDebtLimit = borrowLimit;
  userSharesWei = utils.parseUnits(userShares, underlyingDecimals);
  startingBalance = userSharesWei * underlyingPricePerShare;
  console.log(
    'mount',
    userShares,
    userSharesWei,
    userSharesWei.toString(),
    FixedNumber.from(userShares).toString(),
    FixedNumber.from(userShares).toUnsafeFloat(),
    startingBalance,
    { ...$$props },
  );
  initYield();
  initUnderlying();
  console.log('dum calcs');
  const yieldAvail = userSharesWei * yieldPricePerShare;
  console.log('yield avail', yieldAvail);
  const yieldFormatted = utils.formatUnits(yieldAvail.toString(), underlyingDecimals);
  console.log('yield formatted', yieldFormatted);
  console.log('underlying avail', userSharesWei * underlyingPricePerShare);
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
            <InputNumber
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
            <InputNumber
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
      Deposit Balance: {startingBalance / 10 ** underlyingDecimals}
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
