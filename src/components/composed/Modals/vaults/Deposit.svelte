<script>
import { onMount } from 'svelte';
import { utils, BigNumber } from 'ethers';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import Button from '../../../elements/Button.svelte';
import tempTx from '../../../../stores/tempTx';
import walletBalance from '../../../../stores/walletBalance';

import InputNumber from '../../../elements/inputs/InputNumber.svelte';

export let vaultIndex;

export let yieldToken;
export let underlyingToken;
export let loanRatio;
export let userDeposit;
export let borrowLimit;
export let underlyingDecimals;
export let yieldDecimals;

let yieldBalance;
let yieldSymbol;
let underlyingBalance;
let underlyingSymbol;

let yieldDeposit;
let underlyingDeposit;
let totalDeposit;
let projectedDebtLimit;

let depositDisabled = true;

const deposit = () => {
  let yieldAmnt;
  let udrlyAmnt;
  if (yieldDeposit) {
    yieldAmnt = utils.parseUnits(yieldDeposit.toString(), yieldDecimals);
    $tempTx.amountYield = yieldAmnt;
  }
  if (underlyingDeposit) {
    udrlyAmnt = utils.parseUnits(underlyingDeposit.toString(), underlyingDecimals);
    $tempTx.amountUnderlying = udrlyAmnt;
  }
  $tempTx.yieldToken = yieldToken;
  $tempTx.underlyingToken = underlyingToken;
  $tempTx.targetAddress = null;
  $tempTx.vaultindex = vaultIndex;
  if (yieldAmnt && udrlyAmnt) {
    $tempTx.method = 'multicall';
  } else if (yieldAmnt && !udrlyAmnt) {
    $tempTx.method = 'deposit';
  } else {
    $tempTx.method = 'depositUnderlying';
  }
};

const updateBalances = () => {
  const yieldDepositToWei = utils.parseUnits(yieldDeposit || '0', yieldDecimals);
  const underlyingDepositToWei = utils.parseUnits(underlyingDeposit || '0', underlyingDecimals);
  const totalToWei = yieldDepositToWei.add(underlyingDepositToWei);
  totalDeposit = utils.formatEther(userDeposit.add(totalToWei));
  projectedDebtLimit = utils.formatEther(
    BigNumber.from(borrowLimit).add(
      totalToWei.div(BigNumber.from(parseFloat(utils.formatUnits(loanRatio, 18)))),
    ),
  );
  depositDisabled =
    totalToWei.toString() === '0' || yieldDeposit > yieldBalance || underlyingDeposit > underlyingBalance;
};

$: yieldDeposit, updateBalances();
$: underlyingDeposit, updateBalances();

onMount(() => {
  const yieldObject = $walletBalance.tokens.find((token) => token.address === yieldToken);
  yieldSymbol = yieldObject.symbol;
  yieldBalance = yieldObject.balance;
  const underlyingObject = $walletBalance.tokens.find((token) => token.address === underlyingToken);
  underlyingSymbol = underlyingObject.symbol;
  underlyingBalance = underlyingObject.balance;
});
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex justify-between">
    <p class="inline-block">Deposit Collateral</p>
    <p class="inline-block">Loan Ratio: {100 / parseFloat(utils.formatEther(loanRatio))}%</p>
  </div>
  <div slot="body" class="p-4">
    <div class="flex space-x-4">
      {#if yieldBalance > 0}
        <div class="w-full">
          <label for="yieldInput" class="text-sm text-lightgrey10">
            Available: {yieldBalance}
            {yieldSymbol}
          </label>
          <div
            class="flex bg-grey3 rounded border {yieldDeposit > yieldBalance
              ? 'border-red3'
              : 'border-grey3'}"
          >
            <div class="w-full">
              <InputNumber
                id="yieldInput"
                bind:value="{yieldDeposit}"
                placeholder="~0.00 {yieldSymbol}"
                class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {yieldDeposit >
                yieldBalance
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
                on:clicked="{() => {
                  yieldDeposit = yieldBalance;
                }}"
              />
              <Button
                label="CLEAR"
                width="w-max"
                fontSize="text-xs"
                textColor="lightgrey10"
                backgroundColor="grey3"
                borderSize="0"
                height="h-10"
                on:clicked="{() => {
                  yieldDeposit = '';
                }}"
              />
            </div>
          </div>
        </div>
      {/if}
      {#if underlyingBalance > 0}
        <div class="w-full">
          <label for="underlyingInput" class="text-sm text-lightgrey10">
            Available: {underlyingBalance}
            {underlyingSymbol}
          </label>
          <div
            class="flex bg-grey3 rounded border {underlyingDeposit > underlyingBalance
              ? 'border-red3'
              : 'border-grey3'}"
          >
            <div class="w-full">
              <InputNumber
                id="underlyingInput"
                bind:value="{underlyingDeposit}"
                placeholder="~0.00 {underlyingSymbol}"
                class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {underlyingDeposit >
                underlyingBalance
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
                on:clicked="{() => {
                  underlyingDeposit = underlyingBalance;
                }}"
              />
              <Button
                label="CLEAR"
                width="w-max"
                fontSize="text-xs"
                textColor="lightgrey10"
                backgroundColor="grey3"
                borderSize="0"
                height="h-10"
                on:clicked="{() => {
                  underlyingDeposit = '';
                }}"
              />
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="my-4 text-sm text-lightgrey10">
      Deposit Balance: {utils.formatEther(userDeposit)} -> {totalDeposit || utils.formatEther(userDeposit)}<br
      />
      Borrow Limit: {utils.formatEther(borrowLimit)} -> {projectedDebtLimit || utils.formatEther(borrowLimit)}
    </div>

    <Button
      label="Deposit"
      borderColor="green4"
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      borderSize="1"
      fontSize="text-md"
      on:clicked="{() => deposit()}"
      disabled="{depositDisabled}"
    />
  </div>
</ContainerWithHeader>
