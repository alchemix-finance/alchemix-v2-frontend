<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Button from './Button.svelte';
  import settings from '@stores/settings';

  export let selected = false;
  export let debtAmount = '0';
  export let debtToken: string;
  export let vault;

  const dispatch = createEventDispatcher();

  const updateSelection = () => {
    dispatch('selectionUpdate', { vault });
  };
</script>

<div
  class="w-full rounded border py-2 pr-2 pl-4 flex flex-row space-x-4 {$settings.invertColors
    ? selected
      ? 'border-green4'
      : 'border-grey5inverse'
    : selected
    ? 'border-green4'
    : 'border-grey5'}"
>
  <img
    src="./images/icons/{debtToken.toLowerCase()}_med.svg"
    alt="The icon of alUSD"
    class="w-16 align-middle self-center {selected ? 'opacity-100' : 'opacity-60'}"
  />
  <div class="flex flex-col space-y-2 w-full">
    <p class="text-sm opacity-60">{debtToken} Debt:</p>
    <p class="w-48 truncate font-alcxMono text-lg {selected ? 'opacity-100' : 'opacity-60'}">{debtAmount}</p>
    <Button
      label="{selected ? 'Selected for Repayment' : 'Select for Repayment'}"
      disabled="{selected}"
      width="w-full"
      canToggle="{true}"
      borderColor="bronze3"
      textColorInactive="white2"
      on:clicked="{() => updateSelection()}"
    />
  </div>
</div>
