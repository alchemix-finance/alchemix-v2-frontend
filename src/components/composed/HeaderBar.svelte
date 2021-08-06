<script>
import { Link } from 'svelte-routing';
import account from '../../stores/account';
import settings from '../../stores/settings';
import Dropdown from '../elements/Dropdown.svelte';
import { newConversionRate } from '../../helpers/conversionRate';

function setCurrency(currency) {
  $settings.baseCurrency = currency;
  newConversionRate();
}
</script>

<div class="relative flex items-center justify-between">
  <div class="flex-1 flex items-center">
    <Link to="{$account.signer ? '/accounts' : '/'}">
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
    <Dropdown>
      <div
        slot="label"
        class="px-3
        flex
        justify-between
        w-20
        py-1
        text-opacity-50
        hover:text-opacity-100
        select-none font-alcxTitles text-xs uppercase rounded-l overflow-hidden border border-grey5 text-white2 bg-grey10 hover:bg-grey1"
      >
        <p>{$settings.baseCurrency?.symbol}</p>
        <p>▾</p>
      </div>
      <ul slot="options" class="w-20">
        {#each $settings.allCurrencies as currency}
          <li
            class="cursor-pointer h-8 hover:bg-grey10"
            on:click="{() => setCurrency(currency)}"
          >
            <p
              class="text-center text-opacity-50 hover:text-opacity-100 w-full"
            >
              {currency.symbol}
            </p>
          </li>
        {/each}
      </ul>
    </Dropdown>
  </div>
</div>
