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

  let isActive = false;
</script>

<style>
  /* .dropdown:hover .dropdown-menu,
  .dropdown-menu:hover {
    display: block;
  } */
</style>

<div
  on:focus="{() => (isActive = true)}"
  on:mouseover="{() => (isActive = true)}"
  on:mouseout="{() => (isActive = false)}"
  on:blur="{() => (isActive = false)}"
  on:touchstart="{() => (isActive = !isActive)}"
  class="dropdown inline-block relative w-max"
>
  <slot name="label" />
  <div
    class="
    dropdown-menu
    absolute
    {isActive ? 'block' : 'hidden'}
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
