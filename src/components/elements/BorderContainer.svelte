<script>
  import settings from '@stores/settings';

  export let width = 'w-full';
</script>

<div class="border {$settings.invertColors ? 'border-grey10inverse' : 'border-grey10'} p-2 {width}">
  <slot />
</div>
