<script>
  import settings from '@stores/settings';

  export let pageIcon;
  export let pageTitle;
  export let pageSubtitle;
</script>

<div class="grid grid-cols-12 gap-6 w-full">
  <div class="col-span-1 h-16">
    <img
      src="images/icons/{pageIcon}"
      alt="{pageTitle}"
      class="max-h-full {$settings.invertColors ? 'invertIcons' : ''}"
    />
  </div>
  <div class="col-span-11">
    <p class="text-2xl font-alcxTitles tracking-wider mb-2">
      {pageTitle}
    </p>
    <p class="text-sm text-lightgrey10">
      {pageSubtitle}
    </p>
  </div>
</div>
