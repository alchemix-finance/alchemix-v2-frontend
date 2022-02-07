<script>
  import { onMount } from 'svelte';
  import { utils, BigNumber } from 'ethers';
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
  export let aggregateBalance;

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
  let coveredDebt;
  let remainingBalance;
  let projectedDebtLimit;
  let openDebtAmountFormatted;
  let borrowLimitFormatted;

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
    const maxAmountAvailable = coveredDebt
      .sub(openDebtAmount)
      .mul(loanRatio.div(scalar))
      .gt(BigNumber.from(0));
    maxYieldWithdrawAmount = maxAmountAvailable
      ? utils.formatUnits(yieldToShare, yieldDecimals)
      : utils.formatUnits(
          yieldToShare.sub(openDebtAmount).gt(BigNumber.from(0))
            ? yieldToShare.sub(openDebtAmount)
            : BigNumber.from(0),
          yieldDecimals,
        );
  };

  const setMaxYield = () => {
    yieldWithdrawAmount = maxYieldWithdrawAmount;
    clearUnderlying();
  };

  const clearYield = () => {
    yieldWithdrawAmount = '';
  };

  const initUnderlying = () => {
    underlyingSymbol = $walletBalance.tokens.find((token) => token.address === underlyingToken).symbol;
    const scalar = BigNumber.from(10).pow(underlyingDecimals);
    underlyingToShare = userShares.mul(underlyingPricePerShare).div(scalar);
    const maxAmountAvailable = coveredDebt
      .sub(openDebtAmount)
      .mul(loanRatio.div(scalar))
      .gt(BigNumber.from(0));
    maxUnderlyingWithdrawAmount = maxAmountAvailable
      ? utils.formatUnits(underlyingToShare, underlyingDecimals)
      : utils.formatUnits(
          underlyingToShare.sub(openDebtAmount).gt(BigNumber.from(0))
            ? underlyingToShare.sub(openDebtAmount)
            : BigNumber.from(0),
          underlyingDecimals,
        );
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
        (underlyingWithdrawAmount || 0).toString(),
        underlyingDecimals,
        underlyingPricePerShare,
      );
      underlyingExceeded = underlyingWithdrawAmountShares.gt(userShares);
    } else {
      underlyingWithdrawAmountShares = BigNumber.from(0);
    }
    if (yieldWithdrawAmount) {
      yieldWithdrawAmountShares = toShares(
        (yieldWithdrawAmount || 0).toString(),
        yieldDecimals,
        yieldPricePerShare,
      );
      yieldExceeded = yieldWithdrawAmountShares.gt(userShares);
    } else {
      yieldWithdrawAmountShares = BigNumber.from(0);
    }
    const remainingBalanceBN = userShares.sub(underlyingWithdrawAmountShares).sub(yieldWithdrawAmountShares);
    sharesWithdrawAmount = underlyingWithdrawAmountShares.add(yieldWithdrawAmountShares);
    remainingBalance = utils.formatUnits(remainingBalanceBN, underlyingDecimals);
    const globalCover = toShares(aggregateBalance.toString(), 18, underlyingPricePerShare)
      .div(BigNumber.from(10).pow(18))
      .div(loanRatio.div(BigNumber.from(10).pow(18)));
    const freeCover = globalCover.sub(openDebtAmount).mul(loanRatio.div(BigNumber.from(10).pow(18)));
    withdrawEnabled =
      sharesWithdrawAmount.gt(BigNumber.from(0)) &&
      sharesWithdrawAmount.lt(userShares) &&
      sharesWithdrawAmount.lt(freeCover);
  };

  const withdraw = () => {
    let method;
    if (
      yieldWithdrawAmountShares.gt(BigNumber.from(0)) &&
      (underlyingWithdrawAmountShares.eq(BigNumber.from(0)) || !!!underlyingWithdrawAmountShares)
    ) {
      method = 'withdraw';
    } else if (
      (yieldWithdrawAmountShares.eq(BigNumber.from(0)) || !!!yieldWithdrawAmountShares) &&
      underlyingWithdrawAmountShares.gt(BigNumber.from(0))
    ) {
      method = 'withdrawUnderlying';
    } else {
      method = 'withdrawMulticall';
    }
    const payload = {
      amountYield: yieldWithdrawAmountShares,
      amountUnderlying: underlyingWithdrawAmountShares,
      amountBorrow: null,
      amountRepay: null,
      amountAlToken: null,
      method,
      yieldToken,
      underlyingToken,
      alToken: null,
      targetAddress: null,
      vaultIndex,
      transmuter: null,
      transmuterAddress: null,
      alTokenAllowance: null,
      unexchangedBalance: null,
    };
    tempTx.set({ ...payload });
  };

  $: if (yieldWithdrawAmount) updateBalances();
  $: if (underlyingWithdrawAmount) updateBalances();

  onMount(() => {
    coveredDebt = toShares(aggregateBalance.toString(), 18, underlyingPricePerShare)
      .div(BigNumber.from(10).pow(18))
      .div(loanRatio.div(BigNumber.from(10).pow(18)));
    startingBalance = utils.formatUnits(userShares, underlyingDecimals);
    remainingBalance = startingBalance;
    openDebtAmountFormatted = utils.formatUnits(openDebtAmount, underlyingDecimals);
    borrowLimitFormatted = utils.formatUnits(borrowLimit, underlyingDecimals);
    projectedDebtLimit = borrowLimitFormatted;
    availableShares = userShares.sub(openDebtAmount);
    initUnderlying();
    initYield();
  });
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex justify-between">
    <p class="inline-block">Withdraw Collateral</p>
    <div>
      {#if openDebtAmountFormatted !== '0.0'}
        <p class="inline-block">Debt: {openDebtAmountFormatted} {openDebtSymbol} |</p>
      {/if}
      <p class="inline-block">
        Loan Ratio: {100 / parseFloat(utils.formatEther(loanRatio))}%
      </p>
    </div>
  </div>
  <div slot="body" class="p-4">
    <div class="flex space-x-4">
      <div class="w-full">
        <label for="yieldInput" class="text-sm text-lightgrey10">
          Available: ~{Math.round(parseFloat(maxYieldWithdrawAmount))}
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
          Available: ~{Math.round(parseFloat(maxUnderlyingWithdrawAmount))}
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
      Borrow Limit: {borrowLimitFormatted} -> {projectedDebtLimit}
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
