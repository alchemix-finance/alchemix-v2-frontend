<script>
import { createEventDispatcher } from 'svelte';

export let label = 'Submit';
export let disabled = false;
export let borderColor = 'grey5';
export let backgroundColor = 'grey10';
export let hoverColor = 'grey1';
export let textColor = 'white2';
export let solid = true;
export let borderSize = '2';
export let uppercase = false;
export let fontSize = 'text-xs';
export let width = 'w-full';
export let height = 'h-auto';
export let noHoverEffect = false;
const dispatch = createEventDispatcher();

// @dev emits an event 'clicked' the parent component can listen to
const clickEvent = () => {
  if (!disabled) dispatch('clicked');
};
</script>

<button
  class="border{borderSize === '1' ? '' : `-${borderSize}`}
    border-{borderColor}
    rounded
    px-3
    py-1
    select-none
    font-alcxTitles
    overflow-ellipsis
    {height}
    {width}
    text-{textColor}
    {fontSize}
    {uppercase ? 'uppercase' : ''}
    {solid ? `bg-${backgroundColor}` : `bg-${backgroundColor} bg-opacity-30`}
    hover:{disabled
    ? `bg-${backgroundColor}`
    : noHoverEffect
    ? `hover:bg-${backgroundColor}`
    : `bg-${hoverColor}`}
    hover:{disabled
    ? 'cursor-not-allowed'
    : noHoverEffect
    ? 'cursor-default'
    : 'cursor-pointer'}
    disabled:opacity-50
    "
  disabled="{disabled}"
  on:click="{clickEvent}"
>
  <div
    class="flex {$$slots.leftSlot && $$slots.rightSlot
      ? 'justify-between items-center'
      : $$slots.leftSlot && !$$slots.rightSlot
      ? 'justify-start items-center'
      : 'justify-center'}"
  >
    <slot name="leftSlot" />
    <p class="{$$slots.leftSlot && !$$slots.rightSlot ? 'ml-4' : ''}">
      {label}
    </p>
    <slot name="rightSlot" />
  </div>
</button>
