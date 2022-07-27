<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import { writable } from 'svelte/store';

  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import MaxLossController from '@components/composed/MaxLossController';
  import ToggleSwitch from '@components/elements/ToggleSwitch';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';

  import { withdraw, withdrawUnderlying, multicallWithdraw } from '@stores/v2/vaultActions';
  import { VaultTypes } from '@stores/v2/types';
  import {
    addressStore,
    vaultsStore,
    balancesStore,
    adaptersStore,
    networkStore,
  } from 'src/stores/v2/alcxStore';
  import { signer, vaultsAggregatedBalances, vaultsAggregatedCoveredDebt } from 'src/stores/v2/derived';
  import {
    fetchBalanceByAddress,
    fetchUpdateVaultByAddress,
    fetchAdaptersForVaultType,
  } from 'src/stores/v2/asyncMethods';

  import { modalReset } from '@stores/modal';

  import { getTokenDataFromBalances, aaveDynamicToStaticAmount } from '@stores/v2/helpers';

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
  let convertToStatic = false;

  $: useGateway = vault.useGateway && vault.type === 1;

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

  const clearYield = () => {
    yieldWithdrawAmount = '';
  };

  const clearUnderlying = () => {
    underlyingWithdrawAmount = '';
  };

  const onWithdrawButton = async () => {
    modalReset();

    // @dev we need to fetch the adapter prices
    await fetchAdaptersForVaultType(VaultTypes[VaultTypes[vault.type]], [$signer], $networkStore);

    const adapterPrice = $adaptersStore[vault.type].adapters.filter(
      (adapter) => adapter.yieldToken === vault.address,
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
      await withdraw(
        vault.type,
        vault.yieldToken,
        yieldWithdrawAmountShares,
        $addressStore,
        [$signer],
        $networkStore,
        vault.address,
      )
        .then(() => {
          Promise.all([
            fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore], $networkStore),
            fetchBalanceByAddress(vault.address, [$signer]),
            fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
          ]);
        })
        .catch((e) => {
          const log = e.data ? e.data.message : e.message;
          console.trace(`[onWithdrawButton/withdraw]`, log);
        })
        .finally(() => {
          yieldWithdrawAmount = '';
          underlyingWithdrawAmount = '';
        });
    } else if (
      (yieldWithdrawAmountShares.eq(BigNumber.from(0)) || !!!yieldWithdrawAmountShares) &&
      underlyingWithdrawAmountShares.gt(BigNumber.from(0))
    ) {
      withdrawUnderlying(
        vault.type,
        vault.yieldToken,
        vault.underlyingAddress,
        underlyingWithdrawAmountShares,
        $addressStore,
        BigNumber.from(maximumLoss),
        [$signer],
        minimumOut,
        $networkStore,
        withdrawEth ? 'eth' : vault.yieldToken,
        withdrawEth,
      )
        .then(() => {
          Promise.all([
            fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore], $networkStore),
            fetchBalanceByAddress(vault.address, [$signer]),
            fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
          ]);
        })
        .catch((e) => {
          const log = e.data ? e.data.message : e.message;
          console.trace('[onWithdrawButton/withdrawUnderlying]', log);
        })
        .finally(() => {
          yieldWithdrawAmount = '';
          underlyingWithdrawAmount = '';
        });
    } else {
      multicallWithdraw(
        vault.yieldToken,
        vault.underlyingAddress,
        yieldWithdrawAmountShares,
        underlyingWithdrawAmountShares,
        vault.type,
        $addressStore,
        maximumLoss,
        [$signer],
        minimumOut,
        $networkStore,
      )
        .then(() => {
          Promise.all([
            fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore], $networkStore),
            fetchBalanceByAddress(vault.yieldToken, [$signer]),
            fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
          ]);
        })
        .catch((e) => {
          const log = e.data ? e.data.message : e.message;
          console.trace('[onWithdrawButton/multicallWithdraw]', log);
        })
        .finally(() => {
          yieldWithdrawAmount = '';
          underlyingWithdrawAmount = '';
        });
    }
  };

  function getWithdrawButtonState(_underlyingWithdrawAmount, _yieldWithdrawAmount, _decimals) {
    const sharesWithdrawAmount = _underlyingWithdrawAmount.add(_yieldWithdrawAmount);
    const maxAmountToShares = toShares(maxWithdrawAmountForUnderlying, _decimals, vault.underlyingPerShare);

    return (
      sharesWithdrawAmount.gt(BigNumber.from(0)) &&
      sharesWithdrawAmount.lte(vault.balance) &&
      sharesWithdrawAmount.lte(maxAmountToShares)
    );
  }

  function initializeTokenDataForAddress(address) {
    if (vault) {
      return getTokenDataFromBalances(address, [$balancesStore]);
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
    _decimals,
    _vault,
    _pricePerShare,
    _ratio,
  ) {
    const scalar = (decimals) => BigNumber.from(10).pow(decimals);
    const ratio = _ratio.div(scalar(18));
    // how many underlying tokens are needed to cover a user's debt
    const requiredCover = _openDebtAmount.mul(ratio).lte(BigNumber.from(0))
      ? BigNumber.from(0)
      : _openDebtAmount.mul(ratio);
    // remaining underlying token deposits that could be withdrawn
    const freeCover = _coveredDebtAmount.sub(requiredCover);
    // amount of debt tokens covered by this vault (= deposit amount)
    const vaultCover = _vault.balance
      .mul(_pricePerShare)
      .div(scalar(_decimals))
      .mul(scalar(BigNumber.from(18).sub(_decimals)));
    // amount of tokens available for withdrawal
    const maxWithdrawAmount = vaultCover.sub(freeCover);

    const maxAmount = utils.formatUnits(vaultCover.div(scalar(BigNumber.from(18).sub(_decimals))), _decimals);
    const vaultCoverAmount = vaultCover.lt(BigNumber.from(0))
      ? '0'
      : utils.formatUnits(
          vaultCover.sub(requiredCover).div(scalar(BigNumber.from(18).sub(_decimals))),
          _decimals,
        );

    return vaultCover.gt(BigNumber.from(0))
      ? _openDebtAmount.gt(BigNumber.from(0))
        ? maxWithdrawAmount.lte(BigNumber.from(0))
          ? maxAmount
          : vaultCoverAmount
        : vaultCoverAmount
      : '0';
  }

  $: yieldTokenData = initializeTokenDataForAddress(vault.yieldToken);
  $: underlyingTokenData = initializeTokenDataForAddress(vault.underlyingAddress);
  $: ethData = getTokenDataFromBalances('0xETH', [$balancesStore]);

  $: cDebt = $vaultsAggregatedCoveredDebt[vault.type];

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
    underlyingTokenData.decimals,
    vault,
    vault.underlyingPerShare,
    $vaultsStore[vault.type].ratio,
  );

  $: maxWithdrawAmountForYield = utils.formatUnits(
    utils
      .parseUnits(maxWithdrawAmountForUnderlying, 18)
      .mul(vault.yieldPerShare)
      .div(vault.underlyingPerShare)
      .div(BigNumber.from(10).pow(BigNumber.from(18).sub(yieldTokenData.decimals))),
    yieldTokenData.decimals,
  );

  $: withdrawButtonState = getWithdrawButtonState(
    underlyingWithdrawAmountShares,
    yieldWithdrawAmountShares,
    underlyingTokenData.decimals,
  );
  $: supportedTokens = [yieldTokenData?.symbol, underlyingTokenData?.symbol];
  let activeInputs = 1;
  const selection = writable();
  let _selection;
  selection.subscribe((val) => {
    _selection = val;
  });
  $: if (supportedTokens.length >= 1) {
    selection.set(
      supportedTokens?.map((token) => {
        return {
          token: token,
          selected: false,
          maxWithdrawAmount: utils.parseUnits(
            token === yieldTokenData.symbol ? maxWithdrawAmountForYield : maxWithdrawAmountForUnderlying,
            underlyingTokenData.decimals,
          ),
        };
      }),
    );
  }
  $: metaConfig = VaultTypesInfos[vault.type].metaConfig[vault.address] || false;
  $: canAddInputs = metaConfig ? activeInputs < supportedTokens?.length && metaConfig.multicall : true;
  const addInputs = (token) => {
    _selection.find((entry) => entry.token === token).selected = true;
    selection.set(_selection);
    activeInputs += 1;
  };
  const staticConversion = async (amount) => {
    const amountBN = utils.parseUnits(amount.toString(), yieldTokenData.decimals);
    yieldWithdrawAmount = utils.formatUnits(
      await aaveDynamicToStaticAmount(amountBN, yieldTokenData.symbol, [$signer]),
      yieldTokenData.decimals,
    );
  };
  let selectedTokens = [];
  let inputValues = {};
  $: if (inputValues) {
    if (inputValues[underlyingTokenData.symbol])
      underlyingWithdrawAmount = inputValues[underlyingTokenData.symbol];
    if (inputValues[yieldTokenData.symbol] && !convertToStatic)
      yieldWithdrawAmount = inputValues[yieldTokenData.symbol];
    if (inputValues[yieldTokenData.symbol] && convertToStatic)
      staticConversion(inputValues[yieldTokenData.symbol]);
  }
</script>

{#if vault}
  {#if debt.gt(BigNumber.from(0))}
    <p class="text-center pb-3">
      {$_('chart.debt')}: {utils.formatEther(debt)}
      {VaultTypesInfos[vault.type].name}
    </p>
  {/if}
  {#if useGateway}
    <div class="text-sm text-lightgrey10 w-full flex flex-row justify-between mb-3">
      <span>Withdraw Type:</span>
      <ToggleSwitch label="WETH" secondLabel="ETH" on:toggleChange="{() => switchWithdrawType()}" />
    </div>
  {/if}
  <div class="flex flex-col space-y-4">
    {#if !withdrawEth}
      {#each Array(activeInputs) as o, i}
        <ComplexInput
          supportedTokens="{$selection.filter((entry) => !entry.selected).map((item) => item.token)}"
          bind:selectedToken="{selectedTokens[i]}"
          bind:inputValue="{inputValues[selectedTokens[i]]}"
          externalMax="{$selection.filter((entry) => entry.token === selectedTokens[i])[0]
            ?.maxWithdrawAmount}"
          metaConfig="{metaConfig}"
          vaultAddress="{vault.address}"
          bind:convertToStatic
        />
        {#if canAddInputs}
          <Button
            label="+ {$_('vaults_page.add_collateral_type')}"
            on:clicked="{() => addInputs(selectedTokens[i])}"
            py="py-2"
          />
        {/if}
      {/each}
    {/if}
    {#if withdrawEth}
      <ComplexInput
        bind:inputValue="{underlyingWithdrawAmount}"
        supportedTokens="{[ethData.symbol]}"
        externalMax="{utils.parseUnits(maxWithdrawAmountForUnderlying, underlyingTokenData.decimals)}"
      />
    {/if}
  </div>
  <div class="my-4">
    <MaxLossController bind:maxLoss="{maximumLoss}" />
  </div>
  <div class="my-4 text-sm text-lightgrey10 hidden">
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
{/if}
