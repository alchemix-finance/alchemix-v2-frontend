<script>
  import { createEventDispatcher } from 'svelte';
  import settings from '@stores/settings';

  export let label;
  export let disabled = false;
  export let borderColor = $settings.invertColors ? 'grey5inverse' : 'grey5';
  export let backgroundColor = $settings.invertColors ? 'grey10inverse' : 'grey10';
  export let hoverColor = $settings.invertColors ? 'grey1inverse' : 'grey1';
  export let textColor = $settings.invertColors ? 'white2inverse' : 'white2';
  export let textColorInactive = $settings.invertColors ? 'lightgrey20inverse' : 'lightgrey20';
  export let solid = true;
  export let borderSize = '1';
  export let uppercase = false;
  export let fontSize = 'text-xs';
  export let width = 'w-full';
  export let height = 'h-auto';
  export let noHoverEffect = false;
  export let py = 'py-1';
  export let canToggle = false;
  export let selected = false;
  export let canUnselect = false;

  const dispatch = createEventDispatcher();

  // @dev emits an event 'clicked' the parent component can listen to
  const clickEvent = () => {
    if (!disabled && ((canToggle && !selected) || !canToggle)) {
      dispatch('clicked');
    } else if (canUnselect && selected) {
      selected = false;
      dispatch('clicked');
    }
  };
</script>

<button
  class="border{borderSize === '1' ? '' : `-${borderSize}`}
    border-{borderColor}
    rounded
    px-3
    {py}
    select-none
    font-alcxFlow
    overflow-ellipsis
    {height}
    {width}
    text-{canToggle ? (selected ? textColor : textColorInactive) : `${textColor} text-opacity-80`}
    {fontSize}
    {uppercase ? 'uppercase' : ''}
    {selected ? `bg-${hoverColor}` : solid ? `bg-${backgroundColor}` : `bg-${backgroundColor} bg-opacity-30`}
    hover:{disabled
    ? `bg-${backgroundColor}`
    : noHoverEffect
    ? `hover:bg-${backgroundColor}`
    : `bg-${hoverColor}`}
    hover:{disabled ? 'cursor-not-allowed' : noHoverEffect ? 'cursor-default' : 'cursor-pointer'}
    hover:text-opacity-100
    disabled:opacity-50
    transition-all {$$props.class}
    "
  disabled="{disabled}"
  on:click="{clickEvent}"
>
  <span
    class="flex flex-row {$$slots.leftSlot && $$slots.rightSlot
      ? 'justify-between items-center'
      : $$slots.leftSlot && !$$slots.rightSlot
      ? 'justify-start items-center'
      : !$$slots.leftSlot && $$slots.rightSlot
      ? 'justify-center items-center space-x-4'
      : 'justify-center'}"
  >
    <slot name="leftSlot" />
    {#if label}
      <p class="{$$slots.leftSlot && !$$slots.rightSlot ? 'ml-4' : ''}">
        {label}
      </p>
    {/if}
    <slot name="rightSlot" />
  </span>
</button>
