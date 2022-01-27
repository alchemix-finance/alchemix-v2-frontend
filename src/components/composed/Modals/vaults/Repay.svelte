<script>
import { utils, FixedNumber } from 'ethers';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import Button from '../../../elements/Button.svelte';
import tempTx from '../../../../stores/tempTx';

import InputNumber from '../../../elements/inputs/InputNumber.svelte';

export let underlyingTokens;
export let underlyingPerShare;
export let outstandingDebt;

let underlyingAmount;
let underlyingSymbol;
let underlyingToken;
let underlyingDecimals;

let repayAmount;
let canRepay = false;
let remainingDebt;

const setMaxRepay = () => {
  repayAmount =
    parseFloat(underlyingAmount) >= parseFloat(outstandingDebt) ? outstandingDebt : underlyingAmount;
};

const clearRepay = () => {
  repayAmount = null;
};

const repay = () => {
  const debtFormatted = FixedNumber.from(outstandingDebt).toUnsafeFloat().toFixed(underlyingDecimals);
  const repayFormatted = FixedNumber.from(repayAmount).toUnsafeFloat().toFixed(underlyingDecimals);
  $tempTx.amountRepay =
    parseFloat(repayAmount) > parseFloat(outstandingDebt)
      ? utils.parseUnits(debtFormatted.toString(), underlyingDecimals)
      : utils.parseUnits(repayFormatted.toString(), underlyingDecimals);
  $tempTx.underlyingToken = underlyingToken;
  $tempTx.method = 'repay';
};

const updateBalances = () => {
  remainingDebt =
    parseFloat(repayAmount) > parseFloat(outstandingDebt) ? 0 : outstandingDebt - (repayAmount || 0);
  canRepay = parseFloat(repayAmount) > 0 && parseFloat(repayAmount) <= parseFloat(underlyingAmount);
};

const switchUnderlying = () => {
  if (underlyingSymbol) {
    const token = underlyingTokens.find((entry) => entry.symbol === underlyingSymbol);
    underlyingDecimals = token.decimals;
    underlyingAmount = utils.formatUnits(token.balance, underlyingDecimals);
    underlyingToken = token.address;
    clearRepay();
    updateBalances();
  }
};

$: repayAmount, updateBalances();
$: underlyingSymbol, switchUnderlying();
$: underlyingTokens, console.log(underlyingTokens);
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex items-center justify-between">
    <p class="inline-block">Repay Outstanding Loans</p>
    <select
      id="selectUnderlying"
      class="cursor-pointer border border-grey5 bg-grey1 h-8 rounded p-1 text-xs block w-24"
      bind:value="{underlyingSymbol}"
    >
      {#each underlyingTokens as token}
        <option value="{token.symbol}">{token.symbol}</option>
      {/each}
    </select>
  </div>
  <div slot="body" class="p-4 flex flex-col space-y-4">
    <label for="repayInput" class="text-sm text-lightgrey10">
      Available: {underlyingAmount}
      {underlyingSymbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="repayInput"
          placeholder="~0.00 {underlyingSymbol}"
          bind:value="{repayAmount}"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3"
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
          on:clicked="{() => setMaxRepay()}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => clearRepay()}"
        />
      </div>
    </div>
    <div class="w-full text-sm text-lightgrey10">
      Outstanding Debt: {outstandingDebt} -> {remainingDebt}
    </div>
    <Button
      label="Repay"
      borderColor="green4"
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!canRepay}"
      on:clicked="{() => repay()}"
    />
  </div>
</ContainerWithHeader>
