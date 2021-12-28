<script>
import { onMount } from 'svelte';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import BorderContainer from '../../../elements/BorderContainer.svelte';
import Button from '../../../elements/Button.svelte';
import BalanceQuickSelect from '../../../composed/BalanceQuickSelect';
import tempTx from '../../../../stores/tempTx';
import walletBalance from '../../../../stores/walletBalance';

export let yieldToken;
export let underlyingToken;
export let loanRatio;
export let userDeposit;
export let borrowLimit;

let yieldBalance;
let yieldSymbol;
let underlyingBalance;
let underlyingSymbol;

let yieldDeposit = 0;
let underlyingDeposit = 0;
let totalDeposit;

let projectedTotalDeposit;
let projectedDebtLimit;

const toggleMode = {
  yield: true,
  underlying: false,
  combo: false,
};

const buttonToggler = (key) => {
  Object.keys(toggleMode).forEach((entry) => {
    if (toggleMode[entry] !== key) {
      toggleMode[entry] = false;
    }
  });
  toggleMode[key] = true;
};

const deposit = () => {
  const yieldAmnt = parseFloat(yieldDeposit);
  const udrlyAmnt = parseFloat(underlyingDeposit);
  if (yieldAmnt > 0) $tempTx.amountYield = yieldAmnt;
  if (udrlyAmnt > 0) $tempTx.amountUnderlying = udrlyAmnt;
  $tempTx.yieldToken = yieldToken;
  $tempTx.underlyingToken = underlyingToken;
  if (yieldAmnt > 0 && udrlyAmnt > 0) {
    $tempTx.method = 'multicall';
  } else if (yieldAmnt > 0 && udrlyAmnt <= 0) {
    $tempTx.method = 'deposit';
  } else {
    $tempTx.method = 'depositUnderlying';
  }
};

$: yieldDeposit, (totalDeposit = yieldDeposit + underlyingDeposit);
$: underlyingDeposit, (totalDeposit = yieldDeposit + underlyingDeposit);

onMount(() => {
  if (yieldToken) {
    const activeToken = $walletBalance.tokens.find((token) => token.address === yieldToken);
    yieldBalance = activeToken.balance;
    yieldSymbol = activeToken.symbol;
    console.log(activeToken);
  }
  if (underlyingToken) {
    const activeUnderlying = $walletBalance.tokens.find((token) => token.address === underlyingToken);
    underlyingBalance = activeUnderlying.balance;
    underlyingSymbol = activeUnderlying.symbol;
    console.log(activeUnderlying);
  }
  console.log('props', yieldToken, underlyingToken, userDeposit, loanRatio, borrowLimit);
});
</script>

<BorderContainer>
  <div class="flex justify-between mb-4">
    <Button
      label="{yieldSymbol}"
      width="w-full"
      canToggle="{true}"
      selected="{toggleMode.yield}"
      solid="{false}"
      borderSize="0"
      on:clicked="{() => buttonToggler('yield')}"
    />
    <Button
      label="{underlyingSymbol}"
      width="w-full"
      canToggle="{true}"
      selected="{toggleMode.underlying}"
      solid="{false}"
      borderSize="0"
      on:clicked="{() => buttonToggler('underlying')}"
    />
    <Button
      label="Combo"
      width="w-full"
      canToggle="{true}"
      selected="{toggleMode.combo}"
      solid="{false}"
      borderSize="0"
      on:clicked="{() => buttonToggler('combo')}"
    />
  </div>
  <div class="flex flex-col space-y-2">
    {#if toggleMode.combo}
      <ContainerWithHeader>
        <div class="p-2 text-sm" slot="header">
          <p>Wallet Balance: {yieldBalance} {yieldSymbol}</p>
        </div>
        <div class="p-2" slot="body">
          <input type="number" bind:value="{yieldDeposit}" />
          <BalanceQuickSelect />
        </div>
      </ContainerWithHeader>
      <ContainerWithHeader>
        <div class="p-2 text-sm" slot="header">
          <p>Wallet Balance: {underlyingBalance} {underlyingSymbol}</p>
        </div>
        <div class="p-2" slot="body">
          <input type="number" bind:value="{underlyingDeposit}" />
          <BalanceQuickSelect />
        </div>
      </ContainerWithHeader>
    {:else if toggleMode.yield}
      <ContainerWithHeader>
        <div class="p-2 text-sm" slot="header">
          <p>Wallet Balance: {yieldBalance} {yieldSymbol}</p>
        </div>
        <div class="p-2" slot="body">
          <input type="number" bind:value="{yieldDeposit}" />
          <BalanceQuickSelect />
        </div>
      </ContainerWithHeader>
    {:else if toggleMode.underlying}
      <ContainerWithHeader>
        <div class="p-2 text-sm" slot="header">
          <p>Wallet Balance: {underlyingBalance} {underlyingSymbol}</p>
        </div>
        <div class="p-2" slot="body">
          <input type="number" bind:value="{underlyingDeposit}" />
          <BalanceQuickSelect />
        </div>
      </ContainerWithHeader>
    {/if}
  </div>

  <div class="my-2">
    <ContainerWithHeader>
      <div class="p-2" slot="body">
        <p>Loan Ratio: {parseFloat(loanRatio) * 100}%</p>
        Deposit Balance: {userDeposit} -> {parseFloat(userDeposit) + parseFloat(totalDeposit)}<br />
        Borrow Limit: {borrowLimit} -> {parseFloat(borrowLimit) +
          parseFloat(totalDeposit) * parseFloat(loanRatio)}
      </div>
    </ContainerWithHeader>
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
  />
</BorderContainer>
