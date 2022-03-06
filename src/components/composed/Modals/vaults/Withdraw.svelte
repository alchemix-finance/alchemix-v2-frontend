<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import MaxLossController from '@components/composed/MaxLossController';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import ToggleSwitch from '@components/elements/ToggleSwitch';

  import { withdraw, withdrawUnderlying, multicallWithdraw } from '@stores/v2/vaultActions';
  import { VaultTypes } from '@stores/v2/types';
  import { addressStore, vaultsStore, balancesStore, adaptersStore } from 'src/stores/v2/alcxStore';
  import { signer, vaultsAggregatedBalances } from 'src/stores/v2/derived';
  import {
    fetchBalanceByAddress,
    fetchUpdateVaultByAddress,
    fetchAdaptersForVaultType,
  } from 'src/stores/v2/asyncMethods';

  import { modalReset } from '@stores/modal';

  import { getTokenDataFromBalances, normalizeAmount } from '@stores/v2/helpers';

  import { VaultTypesInfos } from '@stores/v2/constants';
  import settings from '@stores/settings';

  // @dev any balance value submitted through props is of type BigNumber, denoted in wei

  export let borrowLimit;
  export let vault;

  let yieldWithdrawAmountShares;
  let underlyingWithdrawAmountShares;
  let maximumLoss;
  let yieldWithdrawAmount = 0;
  let underlyingWithdrawAmount = 0;

  let withdrawEth = false;
  $: useGateway = vault.useGateway;

  function switchWithdrawType() {
    withdrawEth = !withdrawEth;
    clearUnderlying();
    clearYield();
  }

  /*
   * @param amount the String amount to transform into shares
   * @param decimals the Number of decimal places to use for calculations
   * @param sharePrice the BigNumber to use as price for calculations
   * @returns a BigNumber that represents the amount of shares
   * */
  const toShares = (amount, decimals, sharePrice) => {
    if (amount && decimals && sharePrice) {
      const scalar = BigNumber.from(10).pow(decimals);

      const amountToShares = utils.parseUnits(amount.toString(), decimals).mul(scalar).div(sharePrice);
      // return vault.balance.sub(amountToShares).eq(BigNumber.from('1')) ? vault.balance : amountToShares;
      return vault.balance
        .sub(utils.parseUnits(amount.toString(), decimals).mul(scalar).div(sharePrice))
        .eq(BigNumber.from('1'))
        ? vault.balance
        : utils.parseUnits(amount.toString(), decimals).mul(scalar).div(sharePrice);
    } else {
      return BigNumber.from(0);
    }
  };

  const setMaxYield = (max) => {
    yieldWithdrawAmount = max;
    clearUnderlying();
  };

  const clearYield = () => {
    yieldWithdrawAmount = '';
  };

  const setMaxUnderlying = (max) => {
    underlyingWithdrawAmount = max;
    clearYield();
  };

  const clearUnderlying = () => {
    underlyingWithdrawAmount = '';
  };

  const onWithdrawButton = async () => {
    modalReset();

    // @dev we need to fetch the adapter prices
    await fetchAdaptersForVaultType(VaultTypes[VaultTypes[vault.type]], [$signer]);

    const adapterPrice = $adaptersStore[vault.type].adapters.filter(
      (adapter) =>
        adapter.contractSelector.split('_')[1].toLowerCase() === underlyingTokenData.symbol.toLowerCase(),
    )[0].price;

    const underlyingToYield = underlyingWithdrawAmountShares
      .mul(BigNumber.from(10).pow(underlyingTokenData.decimals))
      .div(adapterPrice);
    const subTokens = underlyingToYield.mul(BigNumber.from(maximumLoss)).div(100000);
    const minimumOut = underlyingToYield.sub(subTokens);

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
        minimumOut,
        withdrawEth,
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
        minimumOut,
      ).then(() => {
        Promise.all([
          fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore]),
          fetchBalanceByAddress(vault.address, [$signer]),
          fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
        ]);
      });
    }
  };

  function getWithdrawButtonState(
    _underlyingWithdrawAmount,
    _yieldWithdrawAmount,
    _openDebtAmount,
    _decimals,
  ) {
    const sharesWithdrawAmount = _underlyingWithdrawAmount.add(_yieldWithdrawAmount);

    const globalCover = toShares($vaultsAggregatedBalances[vault.type].toString(), 18, vault.yieldPerShare)
      .div(BigNumber.from(10).pow(18))
      .div($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)))
      .add(utils.parseUnits(utils.formatUnits(1, _decimals), _decimals));

    const freeCover = globalCover
      .sub(_openDebtAmount.div(BigNumber.from(10).pow(18)))
      .mul($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)));

    return (
      sharesWithdrawAmount.gt(BigNumber.from(0)) &&
      sharesWithdrawAmount.lte(vault.balance) &&
      sharesWithdrawAmount.lte(freeCover)
    );
  }

  function initializeTokenDataForAddress(address) {
    if (vault) {
      return getTokenDataFromBalances(address, [$balancesStore]);
    }
  }

  function initializeCoveredDebt(_vault, _aggregatedBalances, _underlyingTokenData) {
    if (_aggregatedBalances) {
      return _aggregatedBalances;
    }
  }

  function calculateRemainingBalance(
    _vault,
    _underlyingWithdrawAmount,
    _yieldWithdrawAmount,
    _underlyingTokenData,
  ) {
    const _remainingBalanceBN = _vault.balance
      .sub(_underlyingWithdrawAmount.add(_yieldWithdrawAmount))
      .sub(roundingBalancer);

    return utils.formatUnits(_remainingBalanceBN, _underlyingTokenData.decimals);
  }

  function calculateMaxWithdrawAmount(
    _coveredDebtAmount,
    _openDebtAmount,
    _tokenData,
    _vault,
    pricePerShare,
  ) {
    const scalar = (decimals) => BigNumber.from(10).pow(decimals);
    const ratio = $vaultsStore[vault.type].ratio.div(scalar(18));
    const normalizeBalance = utils.parseUnits(utils.formatUnits(_vault.balance, _tokenData.decimals), 18);
    const requiredCover = _openDebtAmount.mul(ratio);
    const freeDeposits = _coveredDebtAmount.sub(requiredCover.div(pricePerShare));
    const vaultCovered = normalizeBalance.sub(requiredCover);
    const maxAmount = freeDeposits.mul(pricePerShare).div(scalar(_tokenData.decimals));
    const maxAmountAvailable = maxAmount.gt(BigNumber.from(0));
    const vaultAvailable = vaultCovered.gt(BigNumber.from(0));

    const shareToAmount = _vault.balance.mul(pricePerShare).div(scalar(_tokenData.decimals));

    const debtToCover = _openDebtAmount.div(BigNumber.from(10).pow(18)).mul($vaultsStore[vault.type].ratio);
    const normalizedShares = normalizeAmount(shareToAmount, _tokenData.decimals, 18);
    // const maxAmountAvailable = normalizedShares.sub(debtToCover).gt(BigNumber.from(0));

    console.table([
      {
        title: 'covered debt amount -> amount of tokens deposited',
        value: _coveredDebtAmount.toString(),
      },
      {
        title: 'open debt amount -> amount of debt taken',
        value: _openDebtAmount.toString(),
      },
      {
        title: 'shares in this vault',
        value: normalizeBalance.toString(),
      },
      {
        title: 'amount covered by this vault',
        value: vaultCovered.toString(),
      },
      {
        title: 'free amount in total',
        value: maxAmount.toString(),
      },
    ]);

    return maxAmountAvailable
      ? utils.formatUnits(shareToAmount, _tokenData.decimals)
      : utils.formatUnits(
          normalizedShares.sub(debtToCover).gt(BigNumber.from(0))
            ? shareToAmount.sub(debtToCover)
            : BigNumber.from(0),
          _tokenData.decimals,
        );
  }

  $: yieldTokenData = initializeTokenDataForAddress(vault.address);
  $: underlyingTokenData = initializeTokenDataForAddress(vault.underlyingAddress);
  $: ethData = getTokenDataFromBalances('0xETH', [$balancesStore]);

  $: cDebt = initializeCoveredDebt(vault, $vaultsAggregatedBalances[vault.type], underlyingTokenData);

  $: yieldWithdrawAmountShares = toShares(yieldWithdrawAmount, yieldTokenData.decimals, vault.yieldPerShare);

  $: underlyingWithdrawAmountShares = toShares(
    underlyingWithdrawAmount,
    underlyingTokenData.decimals,
    vault.underlyingPerShare,
  );

  $: ({ debt } = $vaultsStore[vault.type].debt);

  $: projDebtLimit = vault.balance
    .sub(yieldWithdrawAmountShares.add(underlyingWithdrawAmountShares))
    .div($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)));

  $: roundingBalancer = utils.parseUnits(
    utils.formatUnits(1, underlyingTokenData.decimals),
    underlyingTokenData.decimals,
  );

  $: maxWithdrawAmountForUnderlying = calculateMaxWithdrawAmount(
    cDebt,
    debt,
    underlyingTokenData,
    vault,
    vault.underlyingPerShare,
  );

  $: maxWithdrawAmountForYield = utils.formatUnits(
    utils
      .parseUnits(maxWithdrawAmountForUnderlying, yieldTokenData.decimals)
      .mul(vault.yieldPerShare)
      .div(vault.underlyingPerShare),
    yieldTokenData.decimals,
  );

  $: withdrawButtonState = getWithdrawButtonState(
    underlyingWithdrawAmountShares,
    yieldWithdrawAmountShares,
    debt,
    underlyingTokenData.decimals,
  );
</script>

{#if vault}
  <ContainerWithHeader>
    <div slot="header" class="p-4 text-sm flex justify-between">
      <p class="inline-block">{$_('modals.withdraw_collateral')}</p>
      <div>
        {#if !debt.eq(BigNumber.from(0))}
          <p class="inline-block">
            {$_('chart.debt')}: {utils.formatEther(debt)}
            {VaultTypesInfos[vault.type].name} |
          </p>
        {/if}
        <p class="inline-block">
          {$_('modals.loan_ratio')}: {100 / parseFloat(utils.formatEther($vaultsStore[vault.type].ratio))}%
        </p>
      </div>
    </div>
    <div slot="body" class="p-4">
      {#if useGateway}
        <div class="text-sm text-lightgrey10 w-full flex flex-row justify-between mb-3">
          <span>Withdraw Type:</span>
          <ToggleSwitch label="WETH" secondLabel="ETH" on:toggleChange="{() => switchWithdrawType()}" />
        </div>
      {/if}
      <div class="flex space-x-4">
        {#if !withdrawEth}
          <div class="w-full">
            <label for="yieldInput" class="text-sm text-lightgrey10">
              {$_('available')}: ~{maxWithdrawAmountForYield}
              {yieldTokenData.symbol}
            </label>
            <div
              class="flex {$settings.invertColors
                ? 'bg-grey3inverse'
                : 'bg-grey3'} rounded border {yieldWithdrawAmount > parseFloat(maxWithdrawAmountForYield)
                ? 'border-red3'
                : $settings.invertColors
                ? 'border-grey3inverse'
                : 'border-grey3'}"
            >
              <div class="w-full">
                <InputNumber
                  id="yieldInput"
                  bind:value="{yieldWithdrawAmount}"
                  placeholder="~0.00 {yieldTokenData.symbol}"
                  class="w-full rounded appearance-none text-xl text-right h-full p-4 {$settings.invertColors
                    ? 'bg-grey3inverse'
                    : 'bg-grey3'} {yieldWithdrawAmount > parseFloat(maxWithdrawAmountForYield)
                    ? 'text-red3'
                    : $settings.invertColors
                    ? 'text-lightgrey5inverse'
                    : 'text-lightgrey5'}"
                />
              </div>
              <div class="flex flex-col">
                <Button
                  label="MAX"
                  width="w-full"
                  fontSize="text-xs"
                  textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                  backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => setMaxYield(maxWithdrawAmountForYield)}"
                />
                <Button
                  label="CLEAR"
                  width="w-max"
                  fontSize="text-xs"
                  textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                  backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => clearYield()}"
                />
              </div>
            </div>
          </div>
        {/if}
        <div class="w-full">
          <label for="underlyingInput" class="text-sm text-lightgrey10">
            {$_('available')}: ~{maxWithdrawAmountForUnderlying}
            {withdrawEth ? ethData.symbol : underlyingTokenData.symbol}
          </label>
          <div
            class="flex {$settings.invertColors
              ? 'bg-grey3inverse'
              : 'bg-grey3'} rounded border {underlyingWithdrawAmount >
            parseFloat(maxWithdrawAmountForUnderlying)
              ? 'border-red3'
              : $settings.invertColors
              ? 'border-grey3inverse'
              : 'border-grey3'}"
          >
            <div class="w-full">
              <InputNumber
                id="underlyingInput"
                bind:value="{underlyingWithdrawAmount}"
                placeholder="~0.00 {withdrawEth ? ethData.symbol : underlyingTokenData.symbol}"
                class="w-full rounded appearance-none text-xl text-right h-full p-4 {$settings.invertColors
                  ? 'bg-grey3inverse'
                  : 'bg-grey3'} {underlyingWithdrawAmount > parseFloat(maxWithdrawAmountForUnderlying)
                  ? 'text-red3'
                  : $settings.invertColors
                  ? 'text-lightgrey5inverse'
                  : 'text-lightgrey5'}"
              />
            </div>
            <div class="flex flex-col">
              <Button
                label="MAX"
                width="w-full"
                fontSize="text-xs"
                textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                borderSize="0"
                height="h-10"
                on:clicked="{() => setMaxUnderlying(maxWithdrawAmountForUnderlying)}"
              />
              <Button
                label="CLEAR"
                width="w-max"
                fontSize="text-xs"
                textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                borderSize="0"
                height="h-10"
                on:clicked="{() => clearUnderlying()}"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="my-4">
        <MaxLossController bind:maxLoss="{maximumLoss}" />
      </div>
      <div class="my-4 text-sm text-lightgrey10">
        {$_('modals.deposit_balance')}: {utils.formatUnits(vault.balance, underlyingTokenData.decimals)}
        -> {calculateRemainingBalance(
          vault,
          underlyingWithdrawAmountShares,
          yieldWithdrawAmountShares,
          underlyingTokenData,
        )}
        <br />
        {$_('modals.borrow_limit')}: {utils.formatUnits(borrowLimit, underlyingTokenData.decimals)}
        -> {utils.formatUnits(projDebtLimit, underlyingTokenData.decimals) ||
          utils.formatUnits(borrowLimit, underlyingTokenData.decimals)}
      </div>

      <Button
        label="{$_('actions.withdraw')}"
        borderColor="red4"
        backgroundColor="{$settings.invertColors ? 'red5' : 'red2'}"
        hoverColor="red3"
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
