<!--
Dropdown that opens on click
Used, for eg., in CollateralDropdown on Accounts page
For a dropdown that opens on hover see /Dropdown
-->
<script>
import { clickOutside } from '../../helpers/onClickOutside.js';

let isOpen = false;
const allOptionsOption = { name: 'All' };
let activeOption = allOptionsOption.name;

const handleOpen = () => {
  isOpen = !isOpen;
};

const handleOptionClick = (option) => {
  activeOption = option;
};

const handleClickOutside = () => {
  isOpen = false;
};

export let options = [];
</script>

<style>
.open {
  transform: rotate(180deg);
}
</style>

<div
  class="dropdown flex relative inline-flex cursor-pointer bg-grey10 rounded border-black2 border border-solid"
  use:clickOutside
  on:click_outside="{handleClickOutside}"
  on:click="{handleOpen}"
>
  <div class="flex items-center border-black2 border-r border-solid p-4">
    <img src="images/icons/bar.svg" alt="Collaterals" class="w-3 h-3" />
  </div>

  <div class="mx-14 flex items-center">
    <div>{activeOption}</div>
  </div>

  <div class="flex items-center border-black2 border-l border-solid p-4">
    <img
      class="{isOpen && 'open'}"
      src="images/icons/caret.svg"
      alt="Dropdown"
    />
  </div>

  {#if isOpen}
    <div
      class="dropdown-menu
        absolute
        border-1
        border-grey5
        left-0
        mt-12
        rounded
        select-none
        font-alcxTitles
        overflow-ellipsis
        bg-grey15
        z-50
      "
    >
      <ul class="w-40">
        {#each [allOptionsOption, ...options] as option, i}
          <li
            class="
              cursor-pointer
              py-4
              hover:bg-grey10
              {i === 0 && 'rounded-t'}
              {i === options.length && 'rounded-b'}
            "
            on:click="{() => handleOptionClick(option.name)}"
          >
            <p class="text-center opacity-50">{option.name}</p>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
