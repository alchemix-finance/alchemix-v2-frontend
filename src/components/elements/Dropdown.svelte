<script>
export let borderColor = 'grey5';
export let backgroundColor = 'grey15';
export let borderSize = '1';

let selectedOption;
</script>

<style>
.dropdown:hover .dropdown-menu,
.dropdown-menu:hover {
  display: block;
}
</style>

<div class="dropdown inline-block relative">
  <slot name="label" />
  <div
    class="dropdown-menu absolute hidden border{borderSize === '1'
      ? ''
      : `-${borderSize}`}
    border-{borderColor}
    right-0
    rounded-lg
    select-none
    font-alcxTitles
    overflow-ellipsis
    bg-{backgroundColor}
    shadow-lg
    z-50
    "
  >
    <slot name="options" />
  </div>
</div>
