<!--
Dropdown that opens on hover
Used, for eg., when hovering on an icon
For a dropdown that opens on hover see /DropdownOnClick
-->
<script>
  import settings from '@stores/settings';
  import { clickOutside } from '@helpers/onClickOutside';

  export let borderColor = $settings.invertColors ? 'grey5inverse' : 'grey5';
  export let backgroundColor = $settings.invertColors ? 'grey15inverse' : 'grey15';
  export let borderSize = '1';

  let isActive = false;
  let dropdownRef = undefined;

  function onTouchStart(ev) {
    if (!dropdownRef) return;
    if (ev.target !== dropdownRef) return;

    isActive = !isActive;
  }

  function onClickOutside() {
    if (isActive) isActive = false;
  }
</script>

<style>
  /* .dropdown:hover .dropdown-menu,
  .dropdown-menu:hover {
    display: block;
  } */
</style>

<div
  use:clickOutside
  on:click_outside="{onClickOutside}"
  bind:this="{dropdownRef}"
  on:touchstart="{onTouchStart}"
  on:focus="{() => (isActive = true)}"
  on:mouseover="{() => (isActive = true)}"
  on:mouseout="{() => (isActive = false)}"
  on:blur="{() => (isActive = false)}"
  class="dropdown inline-block relative w-max"
>
  <div class=" pointer-events-none lg:pointer-events-auto">
    <slot name="label" />
  </div>
  <div
    on:click="{onClickOutside}"
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
