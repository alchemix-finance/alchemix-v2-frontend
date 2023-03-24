<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import { writable } from 'svelte/store';

  import Button from '@components/elements/Button.svelte';
  import MaxLossController from '@components/composed/MaxLossController.svelte';
  import ToggleSwitch from '@components/elements/ToggleSwitch.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';

  import { withdraw, withdrawUnderlying, multicallWithdraw, getVaultMaxLoss } from '@stores/v2/vaultActions';
  import { VaultTypes } from '@stores/v2/types';
  import {
    addressStore,
    vaultsStore,
    balancesStore,
    adaptersStore,
    networkStore,
  } from '@stores/v2/alcxStore';
  import { signer, vaultsAggregatedDeposits } from '@stores/v2/derived';
  import {
    fetchBalanceByAddress,
    fetchUpdateVaultByAddress,
    fetchAdaptersForVaultType,
    convertTokenUnits,
  } from '@stores/v2/asyncMethods';

  import { modalReset } from '@stores/modal';

  import {
    getTokenDataFromBalances,
    getTokenDataFromBalancesBySymbol,
    aaveDynamicToStaticAmount,
  } from '@stores/v2/helpers';

  import { VaultTypesInfos } from '@stores/v2/constants';
  import settings from '@stores/settings';

  // @dev any balance value submitted through props is of type BigNumber, denoted in wei

  export let borrowLimit;
  export let vault;

  let yieldWithdrawAmountShares;
  let underlyingWithdrawAmountShares;
  let maximumLoss;
  let maxLossPreset;
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
    console.log(
      yieldWithdrawAmountShares.toString(),
      underlyingWithdrawAmountShares.toString(),
      yieldWithdrawAmountShares.eq(BigNumber.from(0)),
      !!!yieldWithdrawAmountShares,
      underlyingWithdrawAmountShares.gt(BigNumber.from(0)),
    );
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

  async function getWithdrawButtonState(_underlyingWithdrawAmount, _yieldWithdrawAmount, _decimals) {
    const sharesWithdrawAmount = _underlyingWithdrawAmount.add(_yieldWithdrawAmount);
    const maxAmountToShares = await convertTokenUnits(
      vault.type,
      vault.address,
      utils.parseUnits(maxWithdrawAmountForUnderlying, underlyingTokenData.decimals),
      2,
      $signer,
      $networkStore,
    );

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

  async function calculateMaxWithdrawAmount(
    _aggregatedDepositAmount,
    _openDebtAmount,
    _decimals,
    _vault,
    _ratio,
  ) {
    const ratioNormalized = _ratio.div(BigNumber.from(10).pow(18));
    const vaultBalance = await convertTokenUnits(
      _vault.type,
      _vault.address,
      _vault.balance,
      0,
      $signer,
      $networkStore,
    );
    let requiredCover;
    if (_openDebtAmount.gt(BigNumber.from(0))) {
      requiredCover = await convertTokenUnits(
        _vault.type,
        underlyingTokenData.address,
        _openDebtAmount,
        7,
        $signer,
        $networkStore,
      ).then((response) => {
        return response.mul(ratioNormalized);
      });
    } else {
      requiredCover = BigNumber.from(0);
    }
    const otherCover = await convertTokenUnits(
      _vault.type,
      _vault.address,
      _aggregatedDepositAmount,
      0,
      $signer,
      $networkStore,
    ).then((response) => {
      return response.sub(vaultBalance);
    });
    const vaultMaxWithdrawAmount = vaultBalance.sub(requiredCover);
    if (otherCover.gte(requiredCover)) {
      return utils.formatUnits(vaultBalance, _decimals);
    } else if (vaultMaxWithdrawAmount.gt(BigNumber.from(0))) {
      return utils.formatUnits(vaultMaxWithdrawAmount, _decimals);
    } else {
      return utils.formatUnits(vaultBalance.sub(requiredCover), _decimals);
    }
  }

  $: yieldTokenData = initializeTokenDataForAddress(vault.yieldToken);
  $: underlyingTokenData = initializeTokenDataForAddress(vault.underlyingAddress);
  $: ethData = getTokenDataFromBalances('0xETH', [$balancesStore]);

  $: aggregatedDeposits = $vaultsAggregatedDeposits[vault.type];

  $: yieldWithdrawAmountShares = toShares(yieldWithdrawAmount, yieldTokenData.decimals, vault.yieldPerShare);

  $: underlyingWithdrawAmountShares = toShares(
    underlyingWithdrawAmount,
    underlyingTokenData.decimals,
    vault.underlyingPerShare,
  );

  $: ({ debt } = $vaultsStore && $vaultsStore[vault.type] ? $vaultsStore[vault.type].debt : 0);

  let maxWithdrawAmountForUnderlying = '0';
  let maxWithdrawAmountForYield = '0';

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
            token === yieldTokenData.symbol ? yieldTokenData.decimals : underlyingTokenData.decimals,
          ),
        };
      }),
    );
  }
  $: metaConfig = VaultTypesInfos[vault.type].metaConfig[vault.address] || false;
  $: canAddInputs = metaConfig
    ? activeInputs < supportedTokens?.length && metaConfig.multicall
    : activeInputs < supportedTokens?.length;
  const addInputs = (token) => {
    _selection.find((entry) => entry.token === token).selected = true;
    selection.set(_selection);
    activeInputs += 1;
  };
  const staticConversion = async (amount) => {
    const amountBN = utils.parseUnits(amount.toString(), yieldTokenData.decimals);
    yieldWithdrawAmount = utils.formatUnits(
      await aaveDynamicToStaticAmount(amountBN, yieldTokenData.symbol, [$signer], $networkStore),
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

  onMount(async () => {
    if (vault) {
      let { debt } = $vaultsStore && $vaultsStore[vault.type] ? $vaultsStore[vault.type].debt : 0;
      maxLossPreset = await getVaultMaxLoss(vault.address, vault.type, [$signer], $networkStore);
      maxWithdrawAmountForUnderlying = await calculateMaxWithdrawAmount(
        aggregatedDeposits || BigNumber.from(0),
        debt || BigNumber.from(0),
        underlyingTokenData?.decimals || 0,
        vault,
        $vaultsStore[vault.type]?.ratio || BigNumber.from(0),
      );
      maxWithdrawAmountForYield = utils.formatUnits(
        await convertTokenUnits(
          vault.type,
          vault.address,
          utils.parseUnits(maxWithdrawAmountForUnderlying.toString(), underlyingTokenData.decimals),
          3,
          $signer,
          $networkStore,
        ),
        yieldTokenData.decimals,
      );
    }
  });
</script>

{#if vault}
  {#if debt?.gt(BigNumber.from(0))}
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
          externalDecimals="{getTokenDataFromBalancesBySymbol(selectedTokens[i], [$balancesStore])?.decimals}"
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
        supportedTokens="{[ethData?.symbol]}"
        externalMax="{utils.parseUnits(maxWithdrawAmountForUnderlying, underlyingTokenData.decimals)}"
      />
    {/if}
  </div>
  <div class="my-4">
    <MaxLossController bind:maxLoss="{maximumLoss}" maxLossPreset="{maxLossPreset}" />
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
