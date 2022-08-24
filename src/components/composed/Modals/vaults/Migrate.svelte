<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { BarLoader } from 'svelte-loading-spinners';
  import { utils, BigNumber } from 'ethers';

  import settings from '@stores/settings';
  import { migrateVault } from '@stores/v2/vaultActions';
  import {
    convertTokenUnits,
    fetchBalanceByAddress,
    fetchUpdateVaultByAddress,
  } from '@stores/v2/asyncMethods';
  import { vaultsStore, balancesStore, networkStore, addressStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { VaultTypesInfos } from '@stores/v2/constants';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';

  import Button from '@components/elements/Button.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';
  import Dropdown from '@components/elements/Dropdown.svelte';

  export let vault;
  export let vaultType;

  let migrateAmount;
  let loadingTargets = true;
  let selectedVault = {
    name: '',
    symbol: '',
    vault: '',
  };
  let vaultNames = [];
  let vaultDecimals;

  $: targetVaults = $vaultsStore[vaultType].vaultBody
    .filter((body) => body.underlyingAddress === vault.underlyingAddress)
    .filter((body) => body.address !== vault.address)
    .filter((body) => {
      const metaConfig = VaultTypesInfos[vaultType].metaConfig[body.address] || false;
      return metaConfig && vaultType === 1 ? metaConfig.acceptWETH : body;
    });

  const setVault = async (vault) => {
    const _vault = await vault;
    if (_vault.name !== selectedVault.name) {
      selectedVault.name = _vault.name;
      selectedVault.symbol = _vault.symbol;
      selectedVault.vault = _vault.vault;
    }
  };

  const beginMigration = async () => {
    const sharesBase = utils.parseUnits(migrateAmount.toString(), vaultDecimals || 18);
    const underlyingBase = sharesBase.mul(BigNumber.from(15000)).div(100000);
    const minimumUnderlying = sharesBase.sub(underlyingBase);
    const underlyingAmount = await convertTokenUnits(
      vault.type,
      vault.address,
      minimumUnderlying,
      0,
      $signer,
      $networkStore,
    );
    const minimumSharesOut = await convertTokenUnits(
      vault.type,
      vault.address,
      underlyingAmount,
      3,
      $signer,
      $networkStore,
    );
    await migrateVault(
      vault.type,
      vault.address,
      selectedVault.vault,
      sharesBase,
      minimumSharesOut,
      underlyingAmount,
      $networkStore,
      [$signer, $addressStore],
    ).then(() => {
      Promise.all([
        fetchBalanceByAddress(vault.yieldToken, [$signer]),
        fetchBalanceByAddress(vault.address, [$signer]),
        fetchBalanceByAddress(selectedVault.vault, [$signer]),
        fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore], $networkStore),
        fetchUpdateVaultByAddress(vault.type, selectedVault.vault, [$signer, $addressStore], $networkStore),
      ])
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          migrateAmount = '';
        });
    });
  };

  onMount(async () => {
    await Promise.all(
      targetVaults.map(async (_vault) => {
        const metaConfig = VaultTypesInfos[_vault.type].metaConfig[_vault.address] || false;
        const queryAddress =
          metaConfig?.customAddress?.length > 0 ? metaConfig.customAddress : _vault.address;
        const tokenData = await getTokenDataFromBalances(queryAddress, [$balancesStore]);
        return { name: tokenData.name, symbol: tokenData.symbol, vault: _vault.address };
      }),
    )
      .then((result) => {
        vaultNames = [...result];
        setVault(result[0]);
      })
      .finally(async () => {
        loadingTargets = false;
        vaultDecimals = await getTokenDataFromBalances(vault.address, [$balancesStore])?.decimals;
      });
  });
</script>

<div class="flex flex-col space-y-4">
  <div class="flex flex-row space-x-4 h-8">
    <p class="text-sm text-lightgrey10 min-w-max self-center">Target Vault</p>

    <Dropdown>
      <div
        slot="label"
        class="h-8 px-3 py-1 flex justify-between items-center text-opacity-50 hover:text-opacity-100 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border {$settings.invertColors
          ? 'border-lightgrey20inverse text-white2inverse bg-grey10inverse hover:bg-grey1inverse'
          : 'border-lightgrey20 text-white2 bg-grey10 hover:bg-grey1'}"
      >
        {#if !loadingTargets}
          <div class="flex flex-row space-x-4">
            <img src="images/token-icons/{selectedVault.symbol}.svg" alt="Vault Icon" class="h-4" />
            <p>{selectedVault.name}</p>
          </div>
          <p>▾</p>
        {:else}
          <div class="flex flex-row items-center mx-auto">
            <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
          </div>
        {/if}
      </div>
      <ul slot="options" class="w-full">
        {#if vaultNames.length > 0}
          {#each vaultNames as vault}
            <li
              class="cursor-pointer h-12 border-t flex flex-row items-center pl-4 group {$settings.invertColors
                ? 'hover:bg-grey10inverse border-grey10inverse'
                : 'hover:bg-grey10 border-grey10'}"
              on:click="{() => setVault(vault)}"
            >
              <div class="flex flex-row space-x-4 items-center opacity-50 group-hover:opacity-100">
                <img src="images/token-icons/{vault.symbol}.svg" alt="Network Icon" class="h-8" />
                <p>{vault.name}</p>
              </div>
            </li>
          {/each}
        {/if}
      </ul>
    </Dropdown>
  </div>

  <ComplexInput
    bind:inputValue="{migrateAmount}"
    externalMax="{vault?.balance}"
    externalDecimals="{vaultDecimals}"
    supportedTokens="{['Shares']}"
  />

  <Button
    label="{$_('actions.migrate')}"
    borderColor="green4"
    backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
    hoverColor="green4"
    height="h-12"
    fontSize="text-md"
    on:clicked="{() => beginMigration()}"
  />
</div>
