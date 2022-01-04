<script>
import { utils, FixedNumber } from 'ethers';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import Button from '../../../elements/Button.svelte';
import ToggleSwitch from '../../../elements/ToggleSwitch.svelte';
import tempTx from '../../../../stores/tempTx';

export let outstandingDebt;
export let yieldTokens;

let tokenAddress;
let tokenSymbol;
let tokenAmount;
let tokenDecimals;
let yieldPerShare;
let underlyingPerShare;
let underlyingAmount;

let liquidateAmount;
let remainingDebt;
let remainingDeposit;

let userVerified = false;
let canLiquidate = false;

const setUserVerified = (event) => {
  userVerified = event.detail.value;
  updateBalances();
};

const clearLiquidate = () => {
  liquidateAmount = null;
};

const setMaxLiquidate = () => {
  liquidateAmount = parseFloat(tokenAmount) >= parseFloat(outstandingDebt) ? outstandingDebt : tokenAmount;
};

const updateBalances = () => {
  remainingDebt =
    parseFloat(liquidateAmount) > parseFloat(outstandingDebt) ? 0 : outstandingDebt - (liquidateAmount || 0);
  remainingDeposit = tokenAmount - liquidateAmount;
  underlyingAmount = (liquidateAmount / yieldPerShare) * underlyingPerShare;
  canLiquidate =
    parseFloat(liquidateAmount) > 0 && parseFloat(liquidateAmount) <= parseFloat(tokenAmount) && userVerified;
};

const switchUnderlying = () => {
  if (tokenSymbol) {
    const token = yieldTokens.find((entry) => entry.symbol === tokenSymbol);
    tokenDecimals = token.decimals;
    tokenAmount = token.balance * token.yieldPerShare;
    tokenAddress = token.address;
    yieldPerShare = token.yieldPerShare;
    underlyingPerShare = token.underlyingPerShare;
    clearLiquidate();
    updateBalances();
  }
};

const liquidate = () => {
  const debtFormatted = FixedNumber.from(outstandingDebt).toUnsafeFloat().toFixed(tokenDecimals);
  const amountFormatted = FixedNumber.from(liquidateAmount).toUnsafeFloat().toFixed(tokenDecimals);
  $tempTx.amountRepay =
    parseFloat(liquidateAmount) > parseFloat(outstandingDebt)
      ? utils.parseUnits(debtFormatted.toString(), tokenDecimals)
      : utils.parseUnits(amountFormatted.toString(), tokenDecimals);
  $tempTx.yieldToken = tokenAddress;
  $tempTx.method = 'liquidate';
};

$: tokenSymbol, switchUnderlying();
$: liquidateAmount, updateBalances();
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex items-center justify-between">
    <p class="inline-block">Liquidate Your Debt</p>
    <select
      name="selectToken"
      id="selectToken"
      class="cursor-pointer border border-grey5 bg-grey1 h-8 rounded p-1 text-xs block w-24"
      bind:value="{tokenSymbol}"
    >
      {#each yieldTokens as token}
        <option value="{token.symbol}">{token.symbol}</option>
      {/each}
    </select>
  </div>
  <div slot="body" class="flex flex-col space-y-4 p-4">
    <label for="liquidateInput" class="text-sm text-lightgrey10">
      Available: {tokenAmount}
      {tokenSymbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <input
          type="number"
          id="liquidateInput"
          placeholder="~0.00 {tokenSymbol}"
          bind:value="{liquidateAmount}"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 "
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
          on:clicked="{() => setMaxLiquidate()}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => clearLiquidate()}"
        />
      </div>
    </div>
    <div class="w-full text-sm text-lightgrey10">
      Outstanding Debt: {outstandingDebt} -> {remainingDebt} <br />
      Remaining Deposit: {tokenAmount}
      {tokenSymbol} -> {remainingDeposit}
      {tokenSymbol}
    </div>
    <ToggleSwitch
      label="I understand that liquidating will use my deposited collateral to repay the outstanding debt"
      on:toggleChange="{setUserVerified}"
    />
    <Button
      label="Liquidate"
      borderColor="green4"
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!canLiquidate}"
      on:clicked="{() => liquidate()}"
    />
  </div>
</ContainerWithHeader>
