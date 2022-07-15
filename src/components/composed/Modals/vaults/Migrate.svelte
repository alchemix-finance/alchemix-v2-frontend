<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import Button from '@components/elements/Button.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';
  import Dropdown from '@components/elements/Dropdown.svelte';
  import settings from '@stores/settings';
  import { migrateVault } from '@stores/v2/vaultActions';
  import { vaultsStore, balancesStore } from '@stores/v2/alcxStore';
  import { VaultTypesInfos } from '@stores/v2/constants';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { BarLoader } from 'svelte-loading-spinners';

  export let vault;
  export let vaultType;

  let migrateAmount;
  let loadingTargets = true;
  let selectedVault = {
    name: '',
    symbol: '',
  };
  let vaultNames = [];

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
    }
  };

  onMount(async () => {
    await Promise.all(
      targetVaults.map(async (_vault) => {
        const tokenData = await getTokenDataFromBalances(_vault.address, [$balancesStore]);
        return { name: tokenData.name, symbol: tokenData.symbol };
      }),
    )
      .then((result) => {
        vaultNames = [...result];
        setVault(result[0]);
      })
      .finally(() => {
        loadingTargets = false;
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
            <img src="/images/token-icons/{selectedVault.symbol}.svg" alt="Network Icon" class="h-4" />
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
                <img src="/images/token-icons/{vault.symbol}.svg" alt="Network Icon" class="h-8" />
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
    supportedTokens="{['Shares']}"
  />

  <Button
    label="{$_('actions.migrate')}"
    borderColor="green4"
    backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
    hoverColor="green4"
    height="h-12"
    fontSize="text-md"
  />
</div>
