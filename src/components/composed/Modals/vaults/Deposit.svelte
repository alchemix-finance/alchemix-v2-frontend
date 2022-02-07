<script>
  import { onMount } from 'svelte';
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
    const yieldAmnt = parseFloat(yieldDeposit);
    const udrlyAmnt = parseFloat(underlyingDeposit);
    if (yieldAmnt) $tempTx.amountYield = yieldAmnt;
    if (udrlyAmnt) $tempTx.amountUnderlying = udrlyAmnt;
    $tempTx.yieldToken = yieldToken;
    $tempTx.underlyingToken = underlyingToken;
    $tempTx.targetAddress = null;
    $tempTx.vaultIndex = vaultIndex;
    if (yieldAmnt && udrlyAmnt) {
      $tempTx.method = 'multicall';
    } else if (yieldAmnt && !udrlyAmnt) {
      $tempTx.method = 'deposit';
    } else {
      $tempTx.method = 'depositUnderlying';
    }
  };

  const updateBalances = () => {
    totalDeposit = (parseFloat(yieldDeposit) || 0) + (parseFloat(underlyingDeposit) || 0);
    projectedDebtLimit = parseFloat(totalDeposit) / parseFloat(loanRatio);
    depositDisabled = yieldDeposit > yieldBalance || underlyingDeposit > underlyingBalance || !totalDeposit;
  };

  $: yieldDeposit, updateBalances();
  $: underlyingDeposit, updateBalances();

  onMount(() => {
    if (yieldToken) {
      const activeToken = $walletBalance.tokens.find((token) => token.address === yieldToken);
      yieldBalance = activeToken.balance;
      yieldSymbol = activeToken.symbol;
    }
    if (underlyingToken) {
      const activeUnderlying = $walletBalance.tokens.find((token) => token.address === underlyingToken);
      underlyingBalance = activeUnderlying.balance;
      underlyingSymbol = activeUnderlying.symbol;
    }
  });
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex justify-between">
    <p class="inline-block">Deposit Collateral</p>
    <p class="inline-block">Loan Ratio: {100 / parseFloat(loanRatio)}%</p>
  </div>
  <div slot="body" class="p-4">
    <div class="flex space-x-4">
      {#if yieldBalance !== '0.0'}
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
                  yieldDeposit = null;
                }}"
              />
            </div>
          </div>
        </div>
      {/if}
      {#if underlyingBalance !== '0.0'}
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
                  underlyingDeposit = null;
                }}"
              />
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="my-4 text-sm text-lightgrey10">
      Deposit Balance: {userDeposit} -> {totalDeposit || userDeposit}<br />
      Borrow Limit: {borrowLimit} -> {projectedDebtLimit || borrowLimit}
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
