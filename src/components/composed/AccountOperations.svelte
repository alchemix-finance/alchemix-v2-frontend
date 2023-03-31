<script lang="ts">
  import { _ } from 'svelte-i18n';
  import settings from '@stores/settings';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Borrow from '@components/composed/Modals/vaults/Borrow.svelte';
  import Repay from '@components/composed/Modals/vaults/Repay.svelte';
  import Liquidate from '@components/composed/Modals/vaults/Liquidate.svelte';
  import Button from '@components/elements/Button.svelte';

  export let aggregate;
  export let availableVaults;
  export let vaults;

  enum OperationModes {
    Borrow,
    Repay,
    Liquidate,
  }

  let operationMode = OperationModes.Borrow;
  let containerControl;
  let isVisible;

  const setMode = (mode) => {
    if (operationMode !== OperationModes[mode]) {
      operationMode = OperationModes[mode];
      if (!isVisible) {
        containerControl.toggleVisibility();
      }
    } else {
      containerControl.toggleVisibility();
    }
  };
</script>

<div
  class="w-full flex flex-row space-x-4 border rounded {$settings.invertColors
    ? 'bg-grey10inverse border-grey3inverse'
    : 'bg-grey10 border-grey3'}"
>
  <ContainerWithHeader
    bind:this="{containerControl}"
    bind:contentVisible="{isVisible}"
    canToggle="{true}"
    addToggleSpacing="{false}"
    toggleOnlyOnButton="{true}"
    noBorder="{true}"
    isVisible="{false}"
  >
    <div slot="header" class="flex space-x-4">
      <Button
        label="{$_('vaults_page.borrow')}"
        width="w-full"
        height="h-12"
        fontSize="text-sm"
        borderColor="{operationMode === OperationModes.Borrow ? 'bronze3' : ''}"
        textColor="{$settings.invertColors ? 'bronze4' : 'white2'}"
        canToggle="{true}"
        selected="{operationMode === OperationModes.Borrow && isVisible}"
        canUnselect="{true}"
        on:clicked="{() => {
          setMode('Borrow');
        }}"
      >
        <img
          slot="leftSlot"
          src="./images/icons/Icon_Borrow.svg"
          class="{$settings.invertColors ? 'text-bronze4' : 'text-white2'} fill-current h-5"
          alt="borrow"
        />
      </Button>

      <Button
        label="{$_('vaults_page.repay')}"
        width="w-full"
        height="h-12"
        fontSize="text-sm"
        borderColor="{operationMode === OperationModes.Repay ? 'bronze3' : ''}"
        textColor="{$settings.invertColors ? 'bronze4' : 'white2'}"
        canToggle="{true}"
        selected="{operationMode === OperationModes.Repay && isVisible}"
        canUnselect="{true}"
        on:clicked="{() => {
          setMode('Repay');
        }}"
      >
        <img
          slot="leftSlot"
          src="./images/icons/Icon_Repay.svg"
          class="{$settings.invertColors ? 'text-bronze4' : 'text-white2'} fill-current h-5"
          alt="repay"
        />
      </Button>

      <Button
        label="{$_('vaults_page.liquidate')}"
        width="w-full"
        height="h-12"
        fontSize="text-sm"
        borderColor="{operationMode === OperationModes.Liquidate ? 'bronze3' : ''}"
        textColor="{$settings.invertColors ? 'bronze4' : 'white2'}"
        canToggle="{true}"
        selected="{operationMode === OperationModes.Liquidate && isVisible}"
        canUnselect="{true}"
        on:clicked="{() => {
          setMode('Liquidate');
        }}"
      >
        <img
          slot="leftSlot"
          src="./images/icons/Icon_Liquidate.svg"
          class="{$settings.invertColors ? 'text-bronze4' : 'text-white2'} fill-current h-5"
          alt="liquidate"
        />
      </Button>
    </div>
    <div slot="body">
      {#if operationMode === OperationModes.Borrow}
        <Borrow selectedVaults="{availableVaults}" aggregate="{aggregate}" />
      {:else if operationMode === OperationModes.Repay}
        <Repay selectedVaultsType="{availableVaults}" />
      {:else if operationMode === OperationModes.Liquidate}
        <Liquidate selectedVaultsType="{availableVaults}" vaults="{vaults}" />
      {/if}
    </div>
  </ContainerWithHeader>
</div>
