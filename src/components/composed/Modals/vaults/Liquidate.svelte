<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import ToggleSwitch from '../../../elements/ToggleSwitch.svelte';
  import MaxLossController from '@components/composed/MaxLossController';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { addressStore, balancesStore, vaultsStore, adaptersStore } from '@stores/v2/alcxStore';
  import { VaultTypes } from '@stores/v2/types';
  import { VaultTypesInfos } from '@stores/v2/constants';
  import { liquidate } from '@stores/v2/vaultActions';
  import { signer } from '@stores/v2/derived';
  import {
    fetchUpdateVaultByAddress,
    fetchVaultDebt,
    fetchVaultRatio,
    fetchAdaptersForVaultType,
  } from '@stores/v2/asyncMethods';
  import { modalReset } from '@stores/modal';
  import settings from '@stores/settings';

  export let yieldTokens;
  export let vaults;
  export let selectedVaultsType;

  let selectedVaultType = selectedVaultsType[0];
  let selectedYieldToken = 0;

  let maximumLoss;

  let inputLiquidateAmount = 0;

  let toggleForceState = false;
  let userVerifiedToggle = false;

  const onLiquidateButton = async (yieldTokenData, amount, vaultType) => {
    modalReset();

    await fetchAdaptersForVaultType(VaultTypes[VaultTypes[vaultType]], [$signer]);

    const vaultData = vaults.filter(
      (vault) =>
        getTokenDataFromBalances(vault.address, [$balancesStore]).address.toLowerCase() ===
        yieldTokenData.address.toLowerCase(),
    )[0];
    const underlyingTokenData = getTokenDataFromBalances(vaultData.underlyingAddress, [$balancesStore]);

    const adapterPrice = $adaptersStore[vaultType].adapters.filter(
      (adapter) =>
        adapter.contractSelector.split('_')[1].toLowerCase() === underlyingTokenData.symbol.toLowerCase(),
    )[0].price;

    const adapterYieldAmount = amount
      .mul(BigNumber.from(10).pow(underlyingTokenData.decimals))
      .div(BigNumber.from(10).pow(18))
      .div(adapterPrice);
    const subTokens = adapterYieldAmount.mul(BigNumber.from(maximumLoss)).div(100000);
    const minimumOut = adapterYieldAmount.sub(subTokens);

    await liquidate(
      yieldTokenData.address,
      amount.mul(BigNumber.from(10).pow(underlyingTokenData.decimals)).div(BigNumber.from(10).pow(18)),
      vaultType,
      BigNumber.from(maximumLoss),
      [$signer],
      minimumOut,
    ).then(() => {
      Promise.all([
        fetchVaultRatio(vaultType, [$signer]),
        fetchVaultDebt(vaultType, [$addressStore, $signer]),
        fetchUpdateVaultByAddress(vaultType, yieldTokenData.address, [$signer, $addressStore]),
      ])
        .then(() => {
          console.log('[onLiquidateButton/finished]: Data updated!');
        })
        .catch((e) => {
          console.error(`[onLiquidateButton/finished]: ${e}`);
        });
    });
  };

  const setInputMax = (tokenData, debt) => {
    const underlyingBalance18Decimals = utils.parseEther(
      utils.formatUnits(tokenData.balance, tokenData.decimals),
    );

    if (debt.lte(BigNumber.from(0))) {
      inputLiquidateAmount = '';
      return;
    }

    const tDebt = debt.add(utils.parseUnits('1', 16));

    inputLiquidateAmount = underlyingBalance18Decimals.gte(debt)
      ? utils.formatEther(debt)
      : utils.formatEther(underlyingBalance18Decimals);
  };

  const useTokenListForVaultType = (vaultType, [vaultsStore]) => {
    if (!vaultsStore || vaultType === undefined) {
      return [];
    }

    return [
      ...vaultsStore[vaultType].vaultBody.map((bodyVault) => {
        const yieldTokenData = getTokenDataFromBalances(bodyVault.address, [$balancesStore]);

        return {
          address: yieldTokenData.address,
          balance: bodyVault.balance,
          symbol: yieldTokenData.symbol,
          decimals: yieldTokenData.decimals,
          yieldPerShare: bodyVault.yieldPerShare,
          underlyingPerShare: bodyVault.underlyingPerShare,
        };
      }),
    ];
  };

  const useCurrentBalance = (yieldTokenData) => {
    return yieldTokenData.balance
      .mul(yieldTokenData.yieldPerShare)
      .div(BigNumber.from(10).pow(yieldTokenData.decimals));
  };

  const useBigNumberForInput = (inputValue) => {
    if (inputValue === 0 || inputValue === '') {
      return BigNumber.from(0);
    }

    return utils.parseEther(`${inputValue}`);
  };

  const useRemainingBalance = (inputAmount, yieldTokenData) => {
    const vaultBalanceAs18Decimals = utils.parseEther(
      utils.formatUnits(yieldTokenData.balance, yieldTokenData.decimals),
    );

    return vaultBalanceAs18Decimals.sub(inputAmount).lte(BigNumber.from(0))
      ? BigNumber.from(0)
      : vaultBalanceAs18Decimals.sub(inputAmount);
  };

  const checkButtonState = (inputAmount, underlyingTokenData, debt) => {
    const underlyingBalance18Decimals = utils.parseEther(
      utils.formatUnits(underlyingTokenData.balance, underlyingTokenData.decimals),
    );

    return (
      inputAmount.gt(BigNumber.from(0)) &&
      inputAmount.lte(debt) &&
      inputAmount.lte(underlyingBalance18Decimals)
    );
  };

  const setToggleToDefault = () => {
    inputLiquidateAmount = '';
    toggleForceState = false;
    userVerifiedToggle = false;
  };

  $: yieldTokenList = useTokenListForVaultType(selectedVaultType, [$vaultsStore]);
  $: currentYieldBalance = useCurrentBalance(yieldTokenList[selectedYieldToken]);

  $: inputLiquidateAmountBN = useBigNumberForInput(inputLiquidateAmount);

  $: debtAmount = $vaultsStore[selectedVaultType].debt[0] || BigNumber.from(0);

  $: remainingDebtAmount = inputLiquidateAmountBN.gte(debtAmount)
    ? BigNumber.from(0)
    : debtAmount.sub(inputLiquidateAmountBN) || BigNumber.from(0);

  $: remainingBalance = useRemainingBalance(inputLiquidateAmountBN, yieldTokenList[selectedYieldToken]);
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex items-center justify-between">
    <p class="inline-block">{$_('modals.liquidate_debt')}</p>
    <div class="flex gap-1">
      {#if selectedVaultsType.length > 1}
        <select
          id="selectVaultType"
          class="cursor-pointer border {$settings.invertColors
            ? 'border-grey5inverse bg-grey1inverse'
            : 'border-grey5 bg-grey1'} h-8 rounded p-1 text-xs block w-24"
          bind:value="{selectedVaultType}"
          on:change="{setToggleToDefault}"
        >
          {#each selectedVaultsType as vaultType}
            <option value="{vaultType}">{VaultTypesInfos[vaultType].name}</option>
          {/each}
        </select>
      {/if}

      <select
        name="selectToken"
        id="selectToken"
        class="cursor-pointer border {$settings.invertColors
          ? 'border-grey5inverse bg-grey1inverse'
          : 'border-grey5 bg-grey1'} h-8 rounded p-1 text-xs block w-24"
        bind:value="{selectedYieldToken}"
        on:change="{setToggleToDefault}"
      >
        {#each yieldTokenList as token, index}
          <option value="{index}">{token.symbol}</option>
        {/each}
      </select>
    </div>
  </div>
  <div slot="body" class="flex flex-col space-y-4 p-4">
    <label for="liquidateInput" class="text-sm text-lightgrey10">
      {$_('available')}: ~{utils.formatUnits(
        currentYieldBalance,
        yieldTokenList[selectedYieldToken].decimals,
      )}
      {yieldTokenList[selectedYieldToken].symbol}
    </label>
    <div
      class="flex rounded border {$settings.invertColors
        ? 'bg-grey3inverse border-grey3inverse'
        : 'bg-grey3 border-grey3'}"
    >
      <div class="w-full">
        <InputNumber
          id="liquidateInput"
          placeholder="~0.00 {yieldTokenList[selectedYieldToken].symbol}"
          bind:value="{inputLiquidateAmount}"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 {$settings.invertColors
            ? 'bg-grey3inverse'
            : 'bg-grey3'}"
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
          on:clicked="{() => setInputMax(yieldTokenList[selectedYieldToken], debtAmount)}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
          backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
          borderSize="0"
          height="h-10"
          on:clicked="{() => {
            inputLiquidateAmount = '';

            setToggleToDefault();
          }}"
        />
      </div>
    </div>
    <div class="w-full">
      <MaxLossController bind:maxLoss="{maximumLoss}" />
    </div>
    <div class="w-full text-sm text-lightgrey10 hidden">
      {$_('modals.outstanding_debt')}: {utils.formatEther(debtAmount)} -> {utils.formatEther(
        remainingDebtAmount,
      )} <br />
      {$_('modals.remaining_deposit')}: {utils.formatUnits(
        currentYieldBalance,
        yieldTokenList[selectedYieldToken].decimals,
      )}
      {yieldTokenList[selectedYieldToken].symbol} -> {utils.formatEther(remainingBalance)}
      {yieldTokenList[selectedYieldToken].symbol}
    </div>

    <ToggleSwitch
      label="{$_('modals.liq_disclaimer')}"
      forceState="{toggleForceState}"
      on:toggleChange="{() => {
        userVerifiedToggle = !userVerifiedToggle;
      }}"
    />
    <Button
      label="{$_('actions.liquidate')}"
      borderColor="green4"
      backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!(
        checkButtonState(inputLiquidateAmountBN, yieldTokenList[selectedYieldToken], debtAmount) &&
        userVerifiedToggle
      )}"
      on:clicked="{() =>
        onLiquidateButton(yieldTokenList[selectedYieldToken], inputLiquidateAmountBN, selectedVaultType)}"
    />
  </div>
</ContainerWithHeader>
