<script>
  import { _ } from 'svelte-i18n';
  import Button from '@components/elements/Button.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';
  import Dropdown from '@components/elements/Dropdown.svelte';
  import settings from '@stores/settings';

  export let vault;
  let migrateAmount;

  $: console.log(vault);
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
        <img src="/images/token-icons/yvDAI.svg" alt="Network Icon" class="h-4" />
        <p>yvDAI</p>
        <p>▾</p>
      </div>
      <ul slot="options" class="w-full">
        <li
          class="cursor-pointer h-8 border-t {$settings.invertColors
            ? 'hover:bg-grey10inverse border-grey10inverse'
            : 'hover:bg-grey10 border-grey10'}"
        >
          <p class="text-center text-opacity-50 hover:text-opacity-100 w-full">aDAI</p>
        </li>
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
