<script>
  import settings from '@stores/settings';

  export let pageIcon;
  export let pageTitle;
  export let pageSubtitle;
</script>

<div class="flex gap-6 w-full items-center">
  <img
    src="images/icons/{pageIcon}"
    alt="{pageTitle}"
    class="max-h-full h-full w-20 {$settings.invertColors ? 'invertIcons' : ''}"
  />
  <div class="w-full">
    <p class="text-2xl font-alcxTitles tracking-wider mb-2">
      {pageTitle}
    </p>
    <p class="text-sm text-lightgrey10">
      {pageSubtitle}
    </p>
  </div>
</div>
