<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';

  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import { VaultTypesInfos } from '@stores/v2/constants';
  import { addressStore, balancesStore, vaultsStore, networkStore } from '@stores/v2/alcxStore';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { burn, repay } from '@stores/v2/vaultActions';
  import { signer } from '@stores/v2/derived';
  import { fetchBalanceByAddress, fetchVaultDebt, fetchVaultRatio } from '@stores/v2/asyncMethods';
  import { modalReset } from '@stores/modal';
  import settings from '@stores/settings';

  export let selectedVaultsType;

  let inputRepayAmount = 0;

  let currentSelectedVaultType = selectedVaultsType[0];
  let currentSelectedUnderlyingToken = 0;

  const onRepayButton = async (repayAmount, underlyingTokenData, debtTokenData, vaultType) => {
    const _fRepayAmount = utils.parseUnits(utils.formatEther(repayAmount), underlyingTokenData.decimals);

    modalReset();

    if (underlyingTokenData.address === debtTokenData.address) {
      await burn(
        underlyingTokenData.address,
        _fRepayAmount,
        vaultType,
        [$signer, $addressStore],
        $networkStore,
      ).then(() => {
        Promise.all([
          fetchBalanceByAddress(underlyingTokenData.address, [$signer]),
          fetchVaultDebt(vaultType, [$addressStore, $signer], $networkStore),
          fetchVaultRatio(vaultType, [$signer], $networkStore),
        ]).then(() => {
          console.log('[onRepayButton/burn]: Finished data update!');
        });
      });
    } else {
      await repay(
        underlyingTokenData.address,
        _fRepayAmount,
        vaultType,
        [$signer, $addressStore],
        $networkStore,
      ).then(() => {
        Promise.all([
          fetchBalanceByAddress(underlyingTokenData.address, [$signer]),
          fetchVaultDebt(vaultType, [$addressStore, $signer], $networkStore),
          fetchVaultRatio(vaultType, [$signer], $networkStore),
        ]).then(() => {
          console.log('[onRepayButton/burn]: Finished data update!');
        });
      });
    }
  };

  const useTokenListForVaultType = (vaultType, [vaultsStore]) => {
    if (!vaultsStore || vaultType === undefined) {
      return [];
    }

    const debtTokenData = getTokenDataFromBalances(vaultsStore[vaultType].debtTokenAddress, [$balancesStore]);

    return [
      {
        address: debtTokenData.address,
        balance: debtTokenData.balance,
        symbol: debtTokenData.symbol,
        decimals: debtTokenData.decimals,
        underlyingPerShare: BigNumber.from(1),
        debtToken: debtTokenData.symbol,
      },
      ...vaultsStore[vaultType].vaultBody.map((bodyVault) => {
        const underlyingTokenData = getTokenDataFromBalances(bodyVault.underlyingAddress, [$balancesStore]);

        return {
          address: underlyingTokenData.address,
          balance: underlyingTokenData.balance,
          symbol: underlyingTokenData.symbol,
          decimals: underlyingTokenData.decimals,
          underlyingPerShare: bodyVault.underlyingPerShare,
          debtToken: debtTokenData.symbol,
        };
      }),
    ];
  };

  const setInputMax = (underlyingTokenData, debt) => {
    const underlyingBalance18Decimals = utils.parseEther(
      utils.formatUnits(underlyingTokenData.balance, underlyingTokenData.decimals),
    );

    inputRepayAmount = underlyingBalance18Decimals.gte(debt)
      ? utils.formatEther(debt)
      : utils.formatEther(underlyingBalance18Decimals);
  };

  const useBigNumberForInput = (inputValue) => {
    if (inputValue === 0 || inputValue === '') {
      return BigNumber.from(0);
    }

    return utils.parseEther(`${inputValue}`);
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

  $: tokensForVaultType = useTokenListForVaultType(currentSelectedVaultType, [$vaultsStore]);

  $: inputRepayAmountBN = useBigNumberForInput(inputRepayAmount);

  $: debtAmount = $vaultsStore[currentSelectedVaultType].debt[0] || BigNumber.from(0);

  $: remainingDebtAmount = inputRepayAmountBN.gte(debtAmount)
    ? BigNumber.from(0)
    : debtAmount.sub(inputRepayAmountBN) || BigNumber.from(0);

  $: currentSelectedUnderlyingToken, currentSelectedVaultType, (inputRepayAmount = '');
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex items-center justify-between">
    <p class="inline-block">{$_('modals.repay_loans')}</p>
    <div class="flex gap-1">
      {#if selectedVaultsType.length > 1}
        <select
          id="selectVaultType"
          class="cursor-pointer border {$settings.invertColors
            ? 'border-grey5inverse bg-grey1inverse'
            : 'border-grey5 bg-grey1'} h-8 rounded p-1 text-xs block w-24"
          bind:value="{currentSelectedVaultType}"
        >
          {#each selectedVaultsType as vaultType}
            <option value="{vaultType}">{VaultTypesInfos[vaultType].name}</option>
          {/each}
        </select>
      {/if}
      <select
        id="selectUnderlying"
        class="cursor-pointer border {$settings.invertColors
          ? 'border-grey5inverse bg-grey1inverse'
          : 'border-grey5 bg-grey1'} h-8 rounded p-1 text-xs block w-24"
        bind:value="{currentSelectedUnderlyingToken}"
      >
        {#each tokensForVaultType as token, index}
          <option value="{index}">{token.symbol}</option>
        {/each}
      </select>
    </div>
  </div>
  <div slot="body" class="p-4 flex flex-col space-y-4">
    {#if debtAmount.gt(BigNumber.from(0))}
      <p class="text-sm">
        {$_('metrics.open_debt')}: {utils.formatEther(debtAmount)}
        {tokensForVaultType[currentSelectedUnderlyingToken].debtToken}
      </p>
    {/if}
    <label for="repayInput" class="text-sm text-lightgrey10">
      {$_('available')}: {utils.formatUnits(
        tokensForVaultType[currentSelectedUnderlyingToken].balance,
        tokensForVaultType[currentSelectedUnderlyingToken].decimals,
      )}
      {tokensForVaultType[currentSelectedUnderlyingToken].symbol}
    </label>
    <div
      class="flex rounded border {$settings.invertColors
        ? 'bg-grey3inverse border-grey3inverse'
        : 'bg-grey3 border-grey3'}"
    >
      <div class="w-full">
        <InputNumber
          id="repayInput"
          placeholder="~0.00 {tokensForVaultType[currentSelectedUnderlyingToken].symbol}"
          bind:value="{inputRepayAmount}"
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
          on:clicked="{() => setInputMax(tokensForVaultType[currentSelectedUnderlyingToken], debtAmount)}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
          backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
          borderSize="0"
          height="h-10"
          on:clicked="{() => (inputRepayAmount = '')}"
        />
      </div>
    </div>
    <div class="w-full text-sm text-lightgrey10 hidden">
      {$_('modals.outstanding_debt')}: {utils.formatEther(debtAmount)} -> {utils.formatEther(
        remainingDebtAmount,
      )}
    </div>
    <Button
      label="{$_('actions.repay')}"
      borderColor="green4"
      backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!checkButtonState(
        inputRepayAmountBN,
        tokensForVaultType[currentSelectedUnderlyingToken],
        debtAmount,
      )}"
      on:clicked="{() =>
        onRepayButton(
          inputRepayAmountBN,
          tokensForVaultType[currentSelectedUnderlyingToken],
          tokensForVaultType[0],
          currentSelectedVaultType,
        )}"
    />
  </div>
</ContainerWithHeader>
