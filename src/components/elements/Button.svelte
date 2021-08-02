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
const dispatch = createEventDispatcher();

// @dev emits an event 'clicked' the parent component can listen to
const clickEvent = () => {
  if (!disabled) dispatch('clicked');
};
</script>

<button
  class="border{borderSize === '1' ? '' : `-${borderSize}`}
    border-{borderColor}
    rounded-lg
    px-3
    py-1
    select-none
    font-alcxTitles
    text-{textColor}
    {solid ? `bg-${backgroundColor}` : `bg-${backgroundColor} bg-opacity-30`}
    hover:{disabled ? `bg-${backgroundColor}` : `bg-${hoverColor}`}
    hover:{disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    disabled:opacity-50
    "
  disabled="{disabled}"
  on:click="{clickEvent}"
>
  {label}
</button>
