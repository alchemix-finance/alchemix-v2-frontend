<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';

  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ToggleSwitch from '@components/elements/ToggleSwitch.svelte';
  import MaxLossController from '@components/composed/MaxLossController.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber.svelte';
  import DebtCard from '@components/elements/DebtCard.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';

  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import {
    addressStore,
    balancesStore,
    vaultsStore,
    adaptersStore,
    networkStore,
  } from '@stores/v2/alcxStore';
  import { VaultTypes } from '@stores/v2/types';
  import { VaultTypesInfos } from '@stores/v2/constants';
  import { liquidate, getVaultMaxLoss } from '@stores/v2/vaultActions';
  import { signer } from '@stores/v2/derived';
  import {
    fetchUpdateVaultByAddress,
    fetchVaultDebt,
    fetchVaultRatio,
    fetchAdaptersForVaultType,
  } from '@stores/v2/asyncMethods';
  import { modalReset } from '@stores/modal';
  import settings from '@stores/settings';

  export let vaults;
  export let selectedVaultsType;

  let selectedVaultType = selectedVaultsType[0];
  let selectedYieldToken = 0;

  let maximumLoss;
  let maxLossPreset;

  let inputLiquidateAmount = 0;

  let toggleForceState = false;
  let userVerifiedToggle = false;

  const onLiquidateButton = async (yieldTokenData, amount, vaultType) => {
    modalReset();

    await fetchAdaptersForVaultType(VaultTypes[VaultTypes[vaultType]], [$signer], $networkStore);
    const vaultData = vaults.filter(
      (vault) =>
        getTokenDataFromBalances(vault.address, [$balancesStore]).address === yieldTokenData.yieldAddress,
    )[0];
    const underlyingTokenData = getTokenDataFromBalances(vaultData.underlyingAddress, [$balancesStore]);

    const adapterPrice = $adaptersStore[vaultType].adapters
      .filter((adapter) => adapter.yieldToken === yieldTokenData.yieldAddress)[0]
      .price.div(BigNumber.from(10).pow(underlyingTokenData.decimals))
      .mul(BigNumber.from(10).pow(18));

    const adapterYieldAmount = amount.div(adapterPrice);
    const subTokens = adapterYieldAmount.mul(BigNumber.from(maximumLoss)).div(100000);
    const minimumOut = adapterYieldAmount.sub(subTokens);
    const vault = vaults.filter((vault) => vault.underlyingAddress === underlyingTokenData.address)[0];
    await liquidate(
      yieldTokenData.yieldAddress,
      amount,
      vaultType,
      BigNumber.from(maximumLoss),
      [$signer, $addressStore],
      minimumOut,
      $networkStore,
    ).then(() => {
      Promise.all([
        fetchVaultRatio(vaultType, [$signer], $networkStore),
        fetchVaultDebt(vaultType, [$addressStore, $signer], $networkStore),
        fetchUpdateVaultByAddress(vaultType, vault.address, [$signer, $addressStore], $networkStore),
      ])
        .then(() => {
          useTokenListForVaultType(selectedVaultType, [$vaultsStore])[0];
          inputLiquidateAmount = 0;
          userVerifiedToggle = false;
          console.log('[onLiquidateButton/finished]: Data updated!');
        })
        .catch((e) => {
          console.error(`[onLiquidateButton/finished]: ${e}`);
        });
    });
  };

  const useTokenListForVaultType = (vaultType, [vaultsStore]) => {
    if (!vaultsStore || vaultType === undefined) {
      return [];
    }

    const debtTokenData = getTokenDataFromBalances(vaultsStore[vaultType].debtTokenAddress, [$balancesStore]);

    const tokensArr = [];

    for (const vaultBody of vaultsStore[vaultType].vaultBody) {
      const tokenData = getTokenDataFromBalances(vaultBody.address, [$balancesStore]);

      const tokenSymbol = (() => {
        if (VaultTypesInfos[selectedVaultType]?.metaConfig[vaultBody.address] === undefined) {
          return tokenData.symbol;
        }

        if (VaultTypesInfos[selectedVaultType]?.metaConfig[vaultBody.address].token.length <= 0) {
          return tokenData.symbol;
        }

        return VaultTypesInfos[selectedVaultType].metaConfig[vaultBody.address].token;
      })();

      if (!tokensArr.some((entry) => entry.symbol === tokenSymbol)) {
        tokensArr.push({
          address: vaultBody.address,
          yieldAddress: vaultBody.address,
          balance: vaultBody.balance,
          symbol: tokenSymbol,
          decimals: tokenData.decimals,
          yieldPerShare: vaultBody.yieldPerShare,
          underlyingPerShare: vaultBody.underlyingPerShare,
          yieldAmount: vaultBody.yieldAmount,
          underlyingAmount: vaultBody.underlyingAmount,
          debtToken: debtTokenData.symbol,
        });
      }
    }

    return tokensArr;
  };

  const useCurrentBalance = (yieldTokenData) => {
    return yieldTokenData.yieldAmount;
  };

  const useBigNumberForInput = (inputValue, yieldToken) => {
    if (inputValue === 0 || inputValue === '') {
      return BigNumber.from(0);
    }
    return utils.parseUnits(`${inputValue}`, yieldToken.decimals);
  };

  $: yieldTokenList = useTokenListForVaultType(selectedVaultType, [$vaultsStore]).filter((entry) =>
    entry.balance.gt(BigNumber.from(0)),
  );

  $: normalizedUnderlyingBalance =
    yieldTokenList.length > 0
      ? utils.parseEther(
          utils.formatUnits(
            yieldTokenList[selectedYieldToken].balance,
            yieldTokenList[selectedYieldToken].decimals,
          ),
        )
      : BigNumber.from(0);

  const getDebtForVaultType = (vaultType) => {
    if (!$vaultsStore || vaultType === undefined) {
      return BigNumber.from(0);
    }

    return utils.formatEther($vaultsStore[vaultType].debt[0]) || '0';
  };

  let currentSelectedYieldTokenSymbol;

  $: inputLiquidateAmountBN = useBigNumberForInput(inputLiquidateAmount, yieldTokenList[selectedYieldToken]);

  $: debtAmount = $vaultsStore[selectedVaultType].debt[0].gt(BigNumber.from(0))
    ? $vaultsStore[selectedVaultType].debt[0]
    : BigNumber.from(0);

  const updateSelectionData = (value) => {
    selectedVaultType = value.detail.vault;
    currentSelectedYieldTokenSymbol = useTokenListForVaultType(selectedVaultType, [$vaultsStore]).filter(
      (entry) => entry.balance.gt(BigNumber.from(0)),
    )[0].symbol;
  };

  const updateTokenData = (token) => {
    if (!token) {
      selectedYieldToken = 0;
    } else {
      selectedYieldToken = yieldTokenList.findIndex((entry) => entry.symbol === token);
    }
  };

  $: updateTokenData(currentSelectedYieldTokenSymbol);

  onMount(async () => {
    const defaultYieldToken = useTokenListForVaultType(selectedVaultType, [$vaultsStore])[0];
    maxLossPreset = await getVaultMaxLoss(
      defaultYieldToken.address,
      selectedVaultType,
      [$signer],
      $networkStore,
    );
  });
</script>

<ContainerWithHeader noBorder="{true}">
  <div slot="body" class="flex flex-col space-y-4 p-4">
    <div class="flex flex-row space-x-4">
      {#each selectedVaultsType as vaultType}
        <DebtCard
          selected="{selectedVaultType === vaultType}"
          debtToken="{VaultTypesInfos[vaultType].name}"
          debtAmount="{getDebtForVaultType(vaultType)}"
          vault="{vaultType}"
          mode="1"
          on:selectionUpdate="{(value) => updateSelectionData(value)}"
        />
      {/each}
    </div>
    {#if yieldTokenList.length !== 0}
      <ComplexInput
        supportedTokens="{yieldTokenList.map((token) => token.symbol)}"
        externalMax="{yieldTokenList[selectedYieldToken].yieldAmount}"
        bind:inputValue="{inputLiquidateAmount}"
        bind:selectedToken="{currentSelectedYieldTokenSymbol}"
      />

      <div class="w-full">
        <MaxLossController bind:maxLoss="{maximumLoss}" maxLossPreset="{maxLossPreset}" />
      </div>

      <div class="w-max">
        <ToggleSwitch
          secondLabel="{$_('modals.liq_disclaimer')}"
          forceState="{toggleForceState}"
          on:toggleChange="{() => {
            userVerifiedToggle = !userVerifiedToggle;
          }}"
        />
      </div>
      <Button
        label="{$_('actions.liquidate')}"
        borderColor="green4"
        backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
        hoverColor="green4"
        height="h-12"
        fontSize="text-md"
        disabled="{!(
          inputLiquidateAmountBN.gt(BigNumber.from(0)) &&
          inputLiquidateAmountBN.lte(normalizedUnderlyingBalance) &&
          userVerifiedToggle
        )}"
        on:clicked="{() =>
          onLiquidateButton(yieldTokenList[selectedYieldToken], inputLiquidateAmountBN, selectedVaultType)}"
      />
    {:else}
      <div class="w-full">
        <p class="text-center">
          {$_('modals.no_debt')}
        </p>
      </div>
    {/if}
  </div>
</ContainerWithHeader>
