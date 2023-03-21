<script lang="ts">
  // TODO if users have not deposited anything or maxDebt is 0, include a deposit input, craft a multitx
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { BigNumber, utils } from 'ethers';

  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ToggleSwitch from '@components/elements/ToggleSwitch.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';

  import { VaultTypesInfos } from '@stores/v2/constants';
  import { addressStore, balancesStore, vaultsStore, networkStore } from '@stores/v2/alcxStore';
  import { signer, vaultsAggregatedDebt } from '@stores/v2/derived';
  import { mint } from '@stores/v2/vaultActions';
  import { fetchBalanceByAddress, fetchVaultDebt, fetchVaultRatio } from '@stores/v2/asyncMethods';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';
  import settings from '@stores/settings';

  export let selectedVaults;

  let borrowAmount = 0;
  let exportAndTransfer = false;
  let targetWallet;
  let rng = false;
  let targetWalletVerified = false;

  enum Alchemists {
    alUSD,
    alETH,
  }

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

  const clearTarget = () => {
    targetWallet = '';
    verifyAddress(true);
  };

  const onMintButton = async (_borrowAmountBN, _address, _currentVaultType) => {
    const alUSDData = getTokenDataFromBalancesBySymbol(VaultTypesInfos[_currentVaultType].name, [
      $balancesStore,
    ]);

    await mint(_borrowAmountBN, _address, _currentVaultType, [$signer], $networkStore).then(() => {
      Promise.all([
        fetchVaultRatio(_currentVaultType, [$signer], $networkStore),
        fetchVaultDebt(_currentVaultType, [$addressStore, $signer], $networkStore),
        fetchBalanceByAddress(alUSDData.address, [$signer]),
      ]).then(() => {
        clearTarget();
        borrowAmount = 0;
        exportAndTransfer = false;
        console.log('[onMintButton/mint/finish]: Updated values related to borrow!');
      });
    });
  };

  let selectedVault;
  $: defaultSelectedVault = Alchemists[selectedVault] || selectedVaults[0];

  $: debtTokenInfo = VaultTypesInfos[defaultSelectedVault];

  $: supportedTokens = selectedVaults.map((vaultId) => VaultTypesInfos[vaultId].name);

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
      verifyAddress(true);
      return {
        address: checksumAddress,
        error: false,
      };
    } catch {
      verifyAddress(false);
      return {
        address: undefined,
        error: true,
      };
    }
  }

  function verifyToggle(status, wallet) {
    if (!!status.detail.value) {
      checkIfAddressIsValid(wallet);
    } else {
      verifyAddress(false);
    }
  }

  $: availAmount = calculateAvailableAmount($vaultsAggregatedDebt, $vaultsStore, defaultSelectedVault);
  $: maxDebtAmount = getMaxDebt($vaultsAggregatedDebt, defaultSelectedVault);

  $: borrowAmountBN = utils.parseEther(`${borrowAmount}` || `0`);

  $: addressData = checkIfAddressIsValid(targetWallet);
</script>

<ContainerWithHeader noBorder="{true}">
  <div slot="body" class="p-4 flex flex-col space-y-4">
    {#if availAmount.eq(BigNumber.from(0)) && maxDebtAmount.gt(BigNumber.from(0))}
      <p>{$_('modals.no_loan_available')}</p>
    {:else if maxDebtAmount.eq(BigNumber.from(0))}
      <p>{$_('modals.no_debt_limit')}</p>
    {:else}
      <div
        class="flex rounded border {$settings.invertColors
          ? 'bg-grey3inverse border-grey3inverse'
          : 'bg-grey3 border-grey3'}"
      >
        <div class="w-full">
          <ComplexInput
            supportedTokens="{supportedTokens}"
            externalMax="{availAmount}"
            bind:inputValue="{borrowAmount}"
            bind:selectedToken="{selectedVault}"
          />
        </div>
      </div>

      <div class="w-max">
        <ToggleSwitch secondLabel="{$_('modals.transfer_loan')}" on:toggleChange="{setExportAndTransfer}" />
      </div>
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
          <div class="w-max">
            <ToggleSwitch
              secondLabel="{$_('modals.transfer_disclaimer')}"
              on:toggleChange="{(val) => verifyToggle(val, targetWallet)}"
              forceState="{rng}"
            />
          </div>
        </div>
      {/if}
      <Button
        label="{exportAndTransfer
          ? $_('actions.borrow_and_transfer') + ' ' + debtTokenInfo.name
          : $_('actions.borrow') + ' ' + debtTokenInfo.name}"
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
