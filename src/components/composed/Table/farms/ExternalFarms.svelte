<script>
  import { _ } from 'svelte-i18n';
  import settings from '@stores/settings';
  import ExternalActionsCell from './ExternalActionsCell.svelte';
  import FarmNameCell from './FarmNameCell.svelte';

  export let externalFarm;
</script>

<div class="flex flex-row relative items-center px-4">
  <div
    class="flex flex-col border rounded w-full relative {$settings.invertColors
      ? 'bg-grey10inverse border-grey3inverse'
      : 'bg-grey10 border-grey3'}"
  >
    <div class="w-full px-8 py-4 grid grid-cols-3 justify-between">
      <div class="col-span-2">
        <FarmNameCell
          farmIcon="{externalFarm.icon}"
          farmName="{externalFarm.name}"
          farmSubtitle="{externalFarm.subtitle}"
          alignment="justify-self-start"
          pl="pl-0"
        />
      </div>
      <div class="col-span-1">
        <p class="text-center text-sm text-lightgrey10">{$_('table.action')}</p>
        <ExternalActionsCell actions="{externalFarm.actions}" />
      </div>
    </div>
  </div>
</div>
