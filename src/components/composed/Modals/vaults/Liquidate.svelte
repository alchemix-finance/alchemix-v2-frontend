<script>
  import { utils, BigNumber } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import ToggleSwitch from '../../../elements/ToggleSwitch.svelte';
  import tempTx from '../../../../stores/tempTx';

  import InputNumber from '../../../elements/inputs/InputNumber.svelte';

  export let outstandingDebt;
  export let yieldTokens;

  let tokenAddress;
  let tokenSymbol;
  let tokenAmount;
  let tokenAmountFormatted;
  let tokenDecimals;
  let yieldPerShare;
  let underlyingPerShare;
  let underlyingAmount;

  let liquidateAmount;
  let remainingDebt;
  let remainingDebtFormatted;
  let remainingDeposit;
  let remainingDepositFormatted;

  let debtToWei;
  let tokenAmountToShares;
  let liquidateAmountToWei;

  let userVerified = false;
  let canLiquidate = false;

  const setUserVerified = (event) => {
    userVerified = event.detail.value;
    updateBalances();
  };

  const clearLiquidate = () => {
    liquidateAmount = '';
  };

  const setMaxLiquidate = () => {
    liquidateAmount = tokenAmount.gte(debtToWei) ? outstandingDebt : tokenAmountFormatted;
  };

  const updateBalances = () => {
    if (liquidateAmount) {
      liquidateAmountToWei = utils.parseUnits(liquidateAmount.toString() || '0', tokenDecimals);
      remainingDebt = liquidateAmountToWei.gt(debtToWei)
        ? BigNumber.from(0)
        : debtToWei.sub(liquidateAmountToWei);
      remainingDebtFormatted = utils.formatUnits(remainingDebt, tokenDecimals);
      remainingDeposit = liquidateAmountToWei.gt(tokenAmount)
        ? BigNumber.from(0)
        : tokenAmount?.sub(liquidateAmountToWei) || BigNumber.from(0);
      remainingDepositFormatted = utils.formatUnits(remainingDeposit, tokenDecimals);
      underlyingAmount = liquidateAmountToWei.div(yieldPerShare).mul(underlyingPerShare);
      canLiquidate =
        liquidateAmountToWei.gt(BigNumber.from(0)) && liquidateAmountToWei.lte(tokenAmount) && userVerified;
    } else {
      remainingDebtFormatted = outstandingDebt;
      remainingDepositFormatted = tokenAmountFormatted;
    }
  };

  const switchUnderlying = () => {
    if (tokenSymbol) {
      const token = yieldTokens.find((entry) => entry.symbol === tokenSymbol);
      const scalar = BigNumber.from(10).pow(token.decimals);
      tokenDecimals = token.decimals;
      yieldPerShare = utils.parseUnits(token.yieldPerShare, tokenDecimals);
      underlyingPerShare = utils.parseUnits(token.underlyingPerShare, tokenDecimals);
      tokenAmount = token.balance.mul(yieldPerShare).div(scalar);
      tokenAmountFormatted = utils.formatUnits(tokenAmount, tokenDecimals);
      tokenAddress = token.address;
      debtToWei = utils.parseUnits(outstandingDebt, tokenDecimals);
      clearLiquidate();
      updateBalances();
    }
  };

  const liquidate = () => {
    $tempTx.amountRepay = liquidateAmountToWei.gt(debtToWei) ? debtToWei : liquidateAmountToWei;
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
      Available: ~{parseFloat(tokenAmountFormatted).toFixed(4)}
      {tokenSymbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
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
      Outstanding Debt: {outstandingDebt} -> {remainingDebtFormatted} <br />
      Remaining Deposit: {tokenAmountFormatted}
      {tokenSymbol} -> {remainingDepositFormatted}
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
