<script>
export let farmIcon = 'alcx_med.svg';
export let tokenIcon;
export let farmName;
export let farmSubtitle;
</script>

<div class="grid grid-cols-3 gap-8 w-full py-3">
  <div class="relative col-span-1">
    <img src="images/icons/{farmIcon}" alt="{farmName}" class="h-12 w-12" />
    {#if tokenIcon}
      <img src="images/icons/{tokenIcon}.png" alt="{farmName}" class="h-9 w-9 absolute left-6 top-6" />
    {/if}
  </div>
  <div class="col-span-2">
    <p class="font-bold">{farmName}</p>
    <p class="text-sm text-lightgrey10">{farmSubtitle}</p>
  </div>
</div>
