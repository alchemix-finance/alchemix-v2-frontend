<script>
import { Link } from 'svelte-routing';
import Dropdown from '../elements/DropdownLegacy.svelte';

const currencies = ['USD', 'EUR', 'JPY', 'AUSD'];

const eventTest = (event) => {
  console.log(event);
};
</script>

<div class="relative flex items-center justify-between">
  <div class="flex-1 flex items-center">
    <Link to="/">
      <div class="flex-shrink-0 flex items-center">
        <img
          src="images/alchemix_logo.png"
          alt="The Alchemix logo"
          class="w-11"
        />
        <p class="font-alcxTitles uppercase ml-4 text-2xl">Alchemix</p>
      </div>
    </Link>
  </div>
  <div class="absolute inset-y-0 right-0 flex items-center pr-8">
    <Dropdown on:selected="{eventTest}" options="{currencies}" />
  </div>
</div>
