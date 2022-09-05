<script>
  import { _ } from 'svelte-i18n';
  import { slide, fly } from 'svelte/transition';
  import settings from '@stores/settings';

  import Button from '@components/elements/Button.svelte';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import CurrencyCell from '@components/composed/Table/CurrencyCell.svelte';
  import ExpandedTransmuter from '@components/composed/Table/transmuter/ExpandedTransmuter.svelte';

  export let transmuter;
  $: nameConf = transmuter.col2;
  $: depositConf = transmuter.col3;
  $: withdrawConf = transmuter.col4;
  $: claimConf = transmuter.col6;
  $: expandConf = transmuter.col1;

  let isExpanded = false;
  let isHovered = false;

  const toggleExpanded = () => {
    isExpanded = !isExpanded;
  };
</script>

<div class="flex flex-row relative items-center px-4">
  <div
    class="flex flex-col border rounded w-full relative {$settings.invertColors
      ? 'bg-grey10inverse border-grey3inverse'
      : 'bg-grey10 border-grey3'}"
    on:mouseenter="{() => {
      isHovered = true;
    }}"
    on:mouseleave="{() => {
      isHovered = false;
    }}"
  >
    <div class="absolute -left-2 top-8">
      <div class="flex justify-center items-center w-6">
        <Button
          borderColor="bronze3"
          selected="{isHovered}"
          fontSize="text-md"
          py="py-0"
          label="{isExpanded ? '-' : '+'}"
          on:clicked="{() => toggleExpanded()}"
        />
      </div>
    </div>
    <div
      class="w-full px-8 py-4 flex flex-wrap max-w-full lg:flex-nowrap lg:flex-row lg:justify-between hover:cursor-pointer"
      on:click="{() => toggleExpanded()}"
    >
      <div class="flex-2 w-full pb-3 lg:pb-0">
        <FarmNameCell
          farmIcon="{nameConf.farmIcon}"
          tokenIcon="{nameConf.tokenIcon}"
          farmName="{nameConf.farmName}"
          farmSubtitle="{nameConf.farmSubtitle}"
          alignment="{nameConf.alignment}"
        />
      </div>
      <div class="lg:flex-2 w-1/2 lg:w-full">
        <p class="text-center text-sm text-lightgrey10">Deposited</p>
        <CurrencyCell value="{depositConf.value}" token="{depositConf.token}" />
      </div>
      <div class="lg:flex-2 w-1/2 lg:w-full">
        <p class="text-center text-sm text-lightgrey10">Withdrawable</p>
        <CurrencyCell value="{withdrawConf.value}" token="{withdrawConf.token}" />
      </div>
      <div class="flex-2 w-full">
        <p class="text-center text-sm text-lightgrey10">Claimable</p>
        <CurrencyCell value="{claimConf.value}" token="{claimConf.token}" />
      </div>
    </div>
    {#if isExpanded}
      <div
        class="w-full flex flex-col p-4 space-y-4 overflow-hidden border {$settings.invertColors
          ? 'border-grey10inverse bg-grey15inverse'
          : 'border-grey10 bg-grey15'}"
        transition:slide|local
      >
        <ExpandedTransmuter transmuterData="{expandConf.transmuterData}" />
      </div>
    {/if}
  </div>
</div>
