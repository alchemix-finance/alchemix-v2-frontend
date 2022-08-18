<script>
  export let farmIcon;
  export let tokenIcon;
  export let farmName;
  export let farmSubtitle;
  export let pl = 'pl-8';
  export let isBeta = false;
  export let isHalted = false;

  const defaultIcon = 'alcx_med.svg';
</script>

<div class="flex flex-row space-x-3.5 lg:space-x-8 pl-4 md:{pl}">
  <div class="relative">
    {#if isBeta}
      <img src="images/icons/beta.svg" alt="Experimental Vault" class="absolute left-0 top-0 w-8" />
    {/if}
    <img src="images/icons/{farmIcon || defaultIcon}" alt="{farmName}" class="h-12 w-7 lg:w-12" />
    {#if tokenIcon}
    <img src="images/icons/{tokenIcon}.svg" alt="{farmName}" class="absolute h-5 w-5 left-3 lg:w-9 lg:left-6 top-6" />
    {/if}
  </div>
  <div class="flex flex-col justify-center lg:block">
    <p class="text-sm lg:text-base font-bold">{farmName}</p>
    <p class="text-xs lg:text-sm text-lightgrey10">{farmSubtitle}</p>
    {#if isHalted}
    <p class="text-xs lg:text-sm text-red3">Deposits paused</p>
    {/if}
  </div>
</div>
