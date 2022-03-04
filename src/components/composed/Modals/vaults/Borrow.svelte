<script>
  // TODO if users have not deposited anything or maxDebt is 0, include a deposit input, craft a multitx
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { BigNumber, ethers, utils } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import ToggleSwitch from '../../../elements/ToggleSwitch.svelte';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import { VaultTypesInfos } from '@stores/v2/constants';
  import { addressStore, balancesStore, tokensStore, vaultsStore } from 'src/stores/v2/alcxStore';
  import { signer, vaultsAggregatedDebt } from 'src/stores/v2/derived';
  import { mint } from 'src/stores/v2/vaultActions';
  import { fetchBalanceByAddress, fetchVaultDebt, fetchVaultRatio } from 'src/stores/v2/asyncMethods';
  import { getTokenDataFromBalancesBySymbol } from 'src/stores/v2/helpers';
  import { modalReset } from '@stores/modal';
  import settings from '@stores/settings';

  export let selectedVaults;

  let borrowAmount = 0;
  let exportAndTransfer = false;
  let targetWallet;
  let rng = false;
  let targetWalletVerified = false;

  const setExportAndTransfer = () => {
    exportAndTransfer = !exportAndTransfer;
  };

  const verifyAddress = (error) => {
    if (!error) {
      targetWalletVerified = true;
    } else {
      targetWalletVerified = false;
      rng = false;
    }
  };

  const clearBorrow = () => {
    borrowAmount = '0';
  };

  const setMaxBorrow = (amount) => {
    borrowAmount = amount;
  };

  const clearTarget = () => {
    targetWallet = '';
    verifyAddress(true);
  };

  const onMintButton = async (_borrowAmountBN, _address, _currentVaultType) => {
    const alUSDData = getTokenDataFromBalancesBySymbol(VaultTypesInfos[_currentVaultType].name, [
      $balancesStore,
    ]);

    modalReset();

    await mint(_borrowAmountBN, _address, _currentVaultType, [$signer]).then(() => {
      Promise.all([
        fetchVaultRatio(_currentVaultType, [$signer]),
        fetchVaultDebt(_currentVaultType, [$addressStore, $signer]),
        fetchBalanceByAddress(alUSDData.address, [$signer]),
      ]).then(() => {
        console.log('[onMintButton/mint/finish]: Updated values related to borrow!');
      });
    });
  };

  let defaultSelectedVault = selectedVaults[0];

  $: debtTokenInfo = VaultTypesInfos[defaultSelectedVault];

  function calculateAvailableAmount(_aggregatedDebtStore, _vaultsStore, _selectedVault) {
    if (!_aggregatedDebtStore[_selectedVault] || !_vaultsStore[_selectedVault]) {
      return BigNumber.from(0);
    }
    return utils
      .parseUnits(utils.formatUnits(_aggregatedDebtStore[_selectedVault], 18), 18)
      .sub(_vaultsStore[_selectedVault].debt.debt);
  }

  function getMaxDebt(_aggregatedDebtStore, _selectedVault) {
    if (!_aggregatedDebtStore[_selectedVault]) {
      return BigNumber.from(0);
    }

    return _aggregatedDebtStore[_selectedVault];
  }

  function checkIfAddressIsValid(address) {
    try {
      const checksumAddress = utils.getAddress(address);
      address = checksumAddress;
      return {
        address: checksumAddress,
        error: false,
      };
    } catch {
      rng = false;
      return {
        address: undefined,
        error: true,
      };
    }
  }

  $: console.log($vaultsAggregatedDebt[1].toString(), $vaultsStore, defaultSelectedVault);
  $: console.log($vaultsStore);
  $: availAmount = calculateAvailableAmount($vaultsAggregatedDebt, $vaultsStore, defaultSelectedVault);
  $: maxDebtAmount = getMaxDebt($vaultsAggregatedDebt, defaultSelectedVault);
  $: console.log(maxDebtAmount.toString());

  $: borrowAmountBN = utils.parseEther(`${borrowAmount}` || `0`);

  $: addressData = checkIfAddressIsValid(targetWallet);
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex justify-between">
    <p class="inline-block">{$_('actions.borrow')} {debtTokenInfo.name}</p>
    {#if selectedVaults.length > 1}
      <select
        name="selectToken"
        id="selectToken"
        class="cursor-pointer border {$settings.invertColors
          ? 'border-grey5inverse bg-grey1inverse'
          : 'border-grey5 bg-grey1'} h-8 rounded p-1 text-xs block w-24"
        bind:value="{defaultSelectedVault}"
      >
        {#each selectedVaults as vaultId}
          <option value="{vaultId}">{VaultTypesInfos[vaultId].name}</option>
        {/each}
      </select>
    {/if}
  </div>
  <div slot="body" class="p-4 flex flex-col space-y-4">
    {#if availAmount.eq(BigNumber.from(0)) && maxDebtAmount.gt(BigNumber.from(0))}
      <p>{$_('modals.no_loan_available')}</p>
    {:else if maxDebtAmount.eq(BigNumber.from(0))}
      <p>{$_('modals.no_debt_limit')}</p>
    {:else}
      <label for="borrowInput" class="text-sm text-lightgrey10">
        {$_('available')}: {utils.formatEther(availAmount)}
        {debtTokenInfo.name}
      </label>
      <div
        class="flex rounded border {$settings.invertColors
          ? 'bg-grey3inverse border-grey3inverse'
          : 'bg-grey3 border-grey3'}"
      >
        <div class="w-full">
          <InputNumber
            id="borrowInput"
            placeholder="~0.00 {debtTokenInfo.name}"
            bind:value="{borrowAmount}"
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
            on:clicked="{() => setMaxBorrow(utils.formatEther(availAmount))}"
          />
          <Button
            label="CLEAR"
            width="w-max"
            fontSize="text-xs"
            textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
            backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
            borderSize="0"
            height="h-10"
            on:clicked="{() => clearBorrow()}"
          />
        </div>
      </div>

      <ToggleSwitch label="{$_('modals.transfer_loan')}" on:toggleChange="{setExportAndTransfer}" />
      {#if exportAndTransfer}
        <div class="w-full" transition:slide>
          <label
            class="{$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'} text-sm sr-only"
            >{$_('modals.target_wallet')}</label
          >
          <div
            class="flex {$settings.invertColors
              ? 'bg-grey3inverse'
              : 'bg-grey3'} rounded border {addressData.error && targetWallet
              ? 'border-red3'
              : `${$settings.invertColors ? 'border-grey3inverse' : 'border-grey3'}`} mb-4"
          >
            <div class="w-full">
              <input
                type="text"
                id="targetWallet"
                placeholder="0xdeadbeef"
                class="w-full rounded appearance-none text-l text-right h-20 p-4 {$settings.invertColors
                  ? 'bg-grey3inverse'
                  : 'bg-grey3'}"
                bind:value="{targetWallet}"
              />
            </div>
            <Button
              label="CLEAR"
              width="w-max"
              fontSize="text-xs"
              textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
              backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
              borderSize="0"
              on:clicked="{() => clearTarget()}"
            />
          </div>
          {#if addressData.error && targetWallet}
            <p transition:slide class="text-red3 text-center text-sm mb-4">
              {$_('modals.transfer_error')}
            </p>
          {/if}
          <ToggleSwitch
            label="{$_('modals.transfer_disclaimer')}"
            on:toggleChange="{() => checkIfAddressIsValid(targetWallet)}"
            forceState="{rng}"
          />
        </div>
      {/if}
      <Button
        label="{exportAndTransfer ? $_('actions.borrow_and_transfer') : $_('actions.borrow')}"
        borderSize="1"
        borderColor="green4"
        backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
        hoverColor="green4"
        height="h-12"
        fontSize="text-md"
        disabled="{borrowAmountBN.gt(availAmount) ||
          borrowAmountBN.lte(BigNumber.from(0)) ||
          (exportAndTransfer && !targetWalletVerified)}"
        on:clicked="{() =>
          onMintButton(
            borrowAmountBN,
            exportAndTransfer ? addressData.address : $addressStore,
            defaultSelectedVault,
          )}"
      />
    {/if}
  </div>
</ContainerWithHeader>
