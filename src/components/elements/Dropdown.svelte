<script>
import { createEventDispatcher } from 'svelte';

export let label = 'Choose';
export let options = ['Choice 1', 'Choice 2'];
export let disabled = false;
export let borderColor = 'grey5';
export let backgroundColor = 'grey10';
export let hoverColor = 'grey1';
export let textColor = 'white2';
export let solid = false;
export let borderSize = '1';

let selectedOption;

const dispatch = createEventDispatcher();

/*
 * @dev emits an event 'selected' the parent component can listen to
 * @returns the selected value string
 * */
const selectEvent = () => {
  console.log(selectedOption);
  dispatch('selected', {
    selection: selectedOption,
  });
};
</script>

<div
  class="
  space-x-0
    "
>
  <select
    name="`${label}`"
    id="label"
    disabled="{disabled}"
    bind:value="{selectedOption}"
    on:change="{selectEvent}"
    class="appearance-none
    px-3
    py-1
    select-none
    font-alcxTitles
    text-xs
    uppercase
    overflow-hidden
    border{borderSize === '1' ? '' : `-${borderSize}`}
    border-{borderColor}
    rounded-l
    text-{textColor}
    {solid
      ? `bg-${backgroundColor}`
      : `bg-${backgroundColor} bg-opacity-30 text-opacity-50`}
    hover:{disabled ? `bg-${backgroundColor}` : `bg-${hoverColor}`}
    hover:{disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    disabled:opacity-50"
  >
    {#each options as option}
      <option value="{option}">{option}</option>
    {/each}
  </select>
  <span
    class="
    px-2
    pb-1
    py-0.5
    select-none
    rounded-r
    border-l-0
    border{borderSize === '1' ? '' : `-${borderSize}`}
    border-{borderColor}
    text-{textColor}
    {solid
      ? `bg-${backgroundColor}`
      : `bg-${backgroundColor} bg-opacity-30 text-opacity-50`}
    hover:{disabled ? `bg-${backgroundColor}` : `bg-${hoverColor}`}
    hover:{disabled ? 'cursor-not-allowed' : 'cursor-pointer'}">▾</span
  >
</div>
