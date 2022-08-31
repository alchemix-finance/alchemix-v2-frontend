<!--
Dropdown that opens on hover
Used, for eg., when hovering on an icon
For a dropdown that opens on hover see /DropdownOnClick
-->
<script>
  import settings from '@stores/settings';

  export let borderColor = $settings.invertColors ? 'grey5inverse' : 'grey5';
  export let backgroundColor = $settings.invertColors ? 'grey15inverse' : 'grey15';
  export let borderSize = '1';
</script>

<style>
  .dropdown:hover .dropdown-menu,
  .dropdown-menu:hover {
    display: block;
  }
</style>

<div class="dropdown inline-block relative w-max">
  <slot name="label" />
  <div
    class="
    dropdown-menu
    absolute
    hidden
    border{borderSize === '1' ? '' : `-${borderSize}`}
    border-{borderColor}
    right-0
    rounded-lg
    select-none
    font-alcxTitles
    overflow-ellipsis
    bg-{backgroundColor}
    shadow-lg
    z-30
    min-w-full
    max-w-max
    "
  >
    <slot name="options" />
  </div>
</div>
