<script>
  export let farmIcon;
  export let tokenIcon;
  export let farmName;
  export let farmSubtitle;
  export let pl = 'pl-8';
  export let isBeta = false;
  export let isHalted = false;
  export let farmLtv = '50';

  const defaultIcon = 'alcx_med.svg';
</script>

<div class="flex flex-row space-x-8 {pl}">
  <div class="relative">
    {#if isBeta}
      <img src="./images/icons/beta.svg" alt="Experimental Vault" class="absolute left-0 top-0 w-8" />
    {/if}
    <img src="./images/icons/{farmIcon || defaultIcon}" alt="{farmName}" class="h-12 w-12" />
    {#if tokenIcon}
      <img src="./images/icons/{tokenIcon}.svg" alt="{farmName}" class="h-9 w-9 absolute left-6 top-6" />
    {/if}
  </div>
  <div>
    <p class="font-bold">{farmName}</p>
    <p class="text-sm text-lightgrey10">{farmSubtitle}</p>
    <p class="text-sm text-lightgrey10">LTV: {farmLtv}%</p>
    {#if isHalted}
      <p class="text-sm text-red3">Deposits paused</p>
    {/if}
  </div>
</div>
