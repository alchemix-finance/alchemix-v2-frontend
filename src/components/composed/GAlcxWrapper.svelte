<script>
  import { _ } from 'svelte-i18n';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import settings from '@stores/settings';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber';
  import ToggleSwitch from '@components/elements/ToggleSwitch';
  import Button from '@components/elements/Button';
</script>

<ContainerWithHeader>
  <div slot="header" class="py-4 px-6 text-sm flex flex-row justify-between">
    <div class="flex flex-row items-center space-x-4">
      <img src="images/icons/alcx_med.svg" class="h-7" />
      <p>gALCX Wrapper</p>
    </div>
    <ToggleSwitch useColor="{false}" label="Deposit" secondLabel="Withdraw" />
  </div>
  <div slot="body" class="py-4 px-6 flex space-y-8 flex-col">
    <div
      class="flex flex-col p-4 rounded border {$settings.invertColors
        ? 'border-grey10inverse bg-grey10inverse'
        : 'border-grey10 bg-grey10'}"
    >
      <label for="depositInput" class="text-sm mb-4 text-lightgrey10">
        {$_('available')} 0 ALCX
      </label>
      <div
        class="flex rounded border {$settings.invertColors
          ? 'border-grey3inverse bg-grey3inverse'
          : 'border-grey3 bg-grey3'}"
      >
        <div class="w-full">
          <InputNumber
            id="depositInput"
            placeholder="~0.00 ALCX"
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
          />
          <Button
            label="CLEAR"
            width="w-full"
            fontSize="text-xs"
            textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
            backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
            borderSize="0"
            height="h-10"
          />
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 self-center {$settings.invertColors ? 'text-bronze3' : 'text-orange4'}"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
          clip-rule="evenodd"></path>
      </svg>
      <div
        class="w-full rounded text-xl text-center h-full p-4 {$settings.invertColors
          ? 'bg-grey3inverse'
          : 'bg-grey3'}"
      >
        <p>0 gALCX</p>
      </div>
      <Button label="{$_('actions.deposit')}" />
    </div>
  </div>
</ContainerWithHeader>
