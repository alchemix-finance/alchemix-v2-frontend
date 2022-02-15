<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import MaxLossController from '@components/composed/MaxLossController';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';

  import { withdraw, withdrawUnderlying, multicallWithdraw } from '@stores/v2/vaultActions';
  import { addressStore, vaultsStore } from 'src/stores/v2/alcxStore';
  import { signer, vaultsAggregatedBalances } from 'src/stores/v2/derived';
  import { fetchBalanceByAddress, fetchUpdateVaultByAddress } from 'src/stores/v2/asyncMethods';

  import { modalReset } from '@stores/modal';

  import { balancesStore } from '@stores/v2/alcxStore';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';

  import { VaultTypesInfos } from '@stores/v2/constants';

  // @dev any balance value submitted through props is of type BigNumber, denoted in wei

  export let borrowLimit;
  export let vault;

  let yieldWithdrawAmountShares;
  let underlyingWithdrawAmountShares;
  let maximumLoss;
  let yieldWithdrawAmount = 0;
  let underlyingWithdrawAmount = 0;
  /*
   * @param amount the String amount to transform into shares
   * @param decimals the Number of decimal places to use for calculations
   * @param sharePrice the BigNumber to use as price for calculations
   * @returns a BigNumber that represents the amount of shares
   * */
  const toShares = (amount, decimals, sharePrice) => {
    if (amount && decimals && sharePrice) {
      const scalar = BigNumber.from(10).pow(decimals);
      return utils.parseUnits(amount, decimals).mul(scalar).div(sharePrice);
    } else {
      return BigNumber.from(0);
    }
  };

  const setMaxYield = (max) => {
    yieldWithdrawAmount = max;
    clearUnderlying();
  };

  const clearYield = () => {
    yieldWithdrawAmount = 0;
  };

  const setMaxUnderlying = (max) => {
    underlyingWithdrawAmount = max;
    clearYield();
  };

  const clearUnderlying = () => {
    underlyingWithdrawAmount = 0;
  };

  const onWithdrawButton = async () => {
    modalReset();
    if (
      yieldWithdrawAmountShares.gt(BigNumber.from(0)) &&
      (underlyingWithdrawAmountShares.eq(BigNumber.from(0)) || !!!underlyingWithdrawAmountShares)
    ) {
      await withdraw(vault.type, vault.address, yieldWithdrawAmountShares, $addressStore, [$signer]).then(
        () => {
          Promise.all([
            fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore]),
            fetchBalanceByAddress(vault.address, [$signer]),
            fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
          ]);
        },
      );
    } else if (
      (yieldWithdrawAmountShares.eq(BigNumber.from(0)) || !!!yieldWithdrawAmountShares) &&
      underlyingWithdrawAmountShares.gt(BigNumber.from(0))
    ) {
      withdrawUnderlying(
        vault.type,
        vault.address,
        vault.underlyingAddress,
        underlyingWithdrawAmountShares,
        $addressStore,
        BigNumber.from(maximumLoss),
        [$signer],
      ).then(() => {
        Promise.all([
          fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore]),
          fetchBalanceByAddress(vault.address, [$signer]),
          fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
        ]);
      });
    } else {
      multicallWithdraw(
        vault.address,
        vault.underlyingAddress,
        yieldWithdrawAmountShares,
        underlyingWithdrawAmountShares,
        vault.type,
        $addressStore,
        maximumLoss,
        [$signer],
      ).then(() => {
        Promise.all([
          fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore]),
          fetchBalanceByAddress(vault.address, [$signer]),
          fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
        ]);
      });
    }
  };

  function getWithdrawButtonState(_underlyingWithdrawAmount, _yieldWithdrawAmount, _openDebtAmount) {
    const sharesWithdrawAmount = _underlyingWithdrawAmount.add(_yieldWithdrawAmount);

    const globalCover = toShares(
      $vaultsAggregatedBalances[vault.type].toString(),
      18,
      vault.underlyingPerShare,
    )
      .div(BigNumber.from(10).pow(18))
      .div($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)));

    const freeCover = globalCover
      .sub(_openDebtAmount)
      .mul($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)));

    return (
      sharesWithdrawAmount.gt(BigNumber.from(0)) &&
      sharesWithdrawAmount.lt(vault.balance) &&
      sharesWithdrawAmount.lt(freeCover)
    );
  }

  function initializeTokenDataForAddress(address) {
    if (vault) {
      return getTokenDataFromBalances(address, [$balancesStore]);
    }
  }

  function initializeCoveredDebt(_vault, _aggregatedBalances, _underlyingTokenData) {
    if (_aggregatedBalances) {
      return toShares(
        utils.formatUnits(_aggregatedBalances, _underlyingTokenData.decimals),
        18,
        _vault.underlyingPerShare,
      );
    }
  }

  function calculateRemainingBalance(
    _vault,
    _underlyingWithdrawAmount,
    _yieldWithdrawAmount,
    _underlyingTokenData,
  ) {
    const _remainingBalanceBN = _vault.balance.sub(_underlyingWithdrawAmount).sub(_yieldWithdrawAmount);

    return utils.formatUnits(_remainingBalanceBN, _underlyingTokenData.decimals);
  }

  function calculateMaxWithdrawAmount(_coveredDebtAmount, _openDebtAmount, _tokenData, _vault) {
    const scalar = BigNumber.from(10).pow(_tokenData.decimals);
    const amountToShare = _vault.balance.mul(_vault.underlyingPerShare).div(scalar);
    const maxAmountAvailable = _coveredDebtAmount
      .sub(_openDebtAmount)
      .mul($vaultsStore[vault.type].ratio.div(scalar))
      .gt(BigNumber.from(0));

    return maxAmountAvailable
      ? utils.formatUnits(amountToShare, _tokenData.decimals)
      : utils.formatUnits(
          amountToShare.sub(_openDebtAmount).gt(BigNumber.from(0))
            ? amountToShare.sub(_openDebtAmount)
            : BigNumber.from(0),
          _tokenData.decimals,
        );
  }

  $: yieldTokenData = initializeTokenDataForAddress(vault.address);
  $: underlyingTokenData = initializeTokenDataForAddress(vault.underlyingAddress);

  $: cDebt = initializeCoveredDebt(vault, $vaultsAggregatedBalances[vault.type], underlyingTokenData);

  $: yieldWithdrawAmountShares = toShares(
    `${yieldWithdrawAmount}`,
    yieldTokenData.decimals,
    vault.underlyingPerShare,
  );

  $: underlyingWithdrawAmountShares = toShares(
    `${underlyingWithdrawAmount}`,
    underlyingTokenData.decimals,
    vault.underlyingPerShare,
  );

  $: ({ debt } = $vaultsStore[vault.type].debt);

  $: projDebtLimit = vault.balance
    .sub(yieldWithdrawAmountShares.add(underlyingWithdrawAmountShares))
    .div($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)));

  $: maxWithdrawAmountForYield = calculateMaxWithdrawAmount(cDebt, debt, yieldTokenData, vault);
  $: maxWithdrawAmountForUnderlying = calculateMaxWithdrawAmount(cDebt, debt, underlyingTokenData, vault);

  $: withdrawButtonState = getWithdrawButtonState(
    underlyingWithdrawAmountShares,
    yieldWithdrawAmountShares,
    debt,
  );
</script>

{#if vault}
  <ContainerWithHeader>
    <div slot="header" class="p-4 text-sm flex justify-between">
      <p class="inline-block">{$_('modals.withdraw_collateral')}</p>
      <div>
        {#if !debt.eq(BigNumber.from(0))}
          <p class="inline-block">
            {$_('chart.debt')}: {utils.formatUnits(debt, underlyingTokenData.decimals)}
            {VaultTypesInfos[vault.type]} |
          </p>
        {/if}
        <p class="inline-block">
          {$_('modals.loan_ratio')}: {100 / parseFloat(utils.formatEther($vaultsStore[vault.type].ratio))}%
        </p>
      </div>
    </div>
    <div slot="body" class="p-4">
      <div class="flex space-x-4">
        <div class="w-full">
          <label for="yieldInput" class="text-sm text-lightgrey10">
            {$_('available')}: ~{parseFloat(maxWithdrawAmountForYield)}
            {yieldTokenData.symbol}
          </label>
          <div
            class="flex bg-grey3 rounded border {yieldWithdrawAmount > parseFloat(maxWithdrawAmountForYield)
              ? 'border-red3'
              : 'border-grey3'}"
          >
            <div class="w-full">
              <InputNumber
                id="yieldInput"
                bind:value="{yieldWithdrawAmount}"
                placeholder="~0.00 {yieldTokenData.symbol}"
                class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {yieldWithdrawAmount >
                parseFloat(maxWithdrawAmountForYield)
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
                on:clicked="{() => setMaxYield(parseFloat(maxWithdrawAmountForYield))}"
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
            {$_('available')}: ~{parseFloat(maxWithdrawAmountForUnderlying)}
            {underlyingTokenData.symbol}
          </label>
          <div
            class="flex bg-grey3 rounded border {underlyingWithdrawAmount >
            parseFloat(maxWithdrawAmountForUnderlying)
              ? 'border-red3'
              : 'border-grey3'}"
          >
            <div class="w-full">
              <InputNumber
                id="underlyingInput"
                bind:value="{underlyingWithdrawAmount}"
                placeholder="~0.00 {underlyingTokenData.symbol}"
                class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {underlyingWithdrawAmount >
                parseFloat(maxWithdrawAmountForUnderlying)
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
                on:clicked="{() => setMaxUnderlying(parseFloat(maxWithdrawAmountForUnderlying))}"
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
        {$_('modals.deposit_balance')}: {parseFloat(
          utils.formatUnits(vault.balance, underlyingTokenData.decimals),
        ).toPrecision(2)}
        -> {calculateRemainingBalance(
          vault,
          underlyingWithdrawAmountShares,
          yieldWithdrawAmountShares,
          underlyingTokenData,
        )}
        <br />
        {$_('modals.borrow_limit')}: {utils.formatUnits(borrowLimit, underlyingTokenData.decimals)} -> {utils.formatUnits(
          projDebtLimit,
          underlyingTokenData.decimals,
        ) || utils.formatUnits(borrowLimit, underlyingTokenData.decimals)}
      </div>

      <div class="my-4">
        <MaxLossController bind:maxLoss="{maximumLoss}" />
      </div>

      <Button
        label="{$_('actions.withdraw')}"
        borderColor="red4"
        backgroundColor="red2"
        hoverColor="red4"
        height="h-12"
        borderSize="1"
        fontSize="text-md"
        solid="{withdrawButtonState}"
        on:clicked="{onWithdrawButton}"
        disabled="{!withdrawButtonState}"
      />
    </div>
  </ContainerWithHeader>
{/if}
