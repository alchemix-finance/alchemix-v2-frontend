<script>
import Button from '../components/elements/Button.svelte';
import Dropdown from '../components/elements/Dropdown.svelte';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import BorderContainer from '../components/elements/BorderContainer.svelte';
import GasCard from '../components/elements/GasCard.svelte';
import global from '../stores/global';
import settings from '../stores/settings';
import account from '../stores/account';
import { setCurrency, setLanguage, setGas } from '../helpers/userSettings';
import { connect } from '../helpers/walletManager';
</script>

<ViewContainer>
  <div slot="head">
    <Button
      label="←"
      borderSize="1"
      width="w-8"
      height="h-8"
      fontSize="text-md"
      on:clicked="{() => history.back()}"
    />
    <span class="ml-4">Settings</span>
  </div>
  <BorderContainer>
    <div class="bg-grey10 rounded p-8">
      <div id="locale-settings" class="mb-4">
        <p class="opacity-50 mb-3">Locale</p>
        <span>Base Currency</span>
        <Dropdown>
          <div
            slot="label"
            class="px-3 flex justify-between w-20 py-1 text-opacity-50 hover:text-opacity-100
        select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border border-grey5 text-white2 bg-grey10 hover:bg-grey1"
          >
            <p>{$settings.baseCurrency?.symbol}</p>
            <p>▾</p>
          </div>
          <ul slot="options" class="w-20">
            {#each $global.allCurrencies as currency}
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

        <span>Language</span>
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
        select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border border-grey5 text-white2 bg-grey10 hover:bg-grey1"
          >
            <p>{$settings.userLanguage?.name}</p>
            <p>▾</p>
          </div>
          <ul slot="options" class="w-20">
            {#each $global.languages as language}
              <li
                class="cursor-pointer h-8 hover:bg-grey10"
                on:click="{() => setLanguage(language)}"
              >
                <p
                  class="text-center text-opacity-50 hover:text-opacity-100 w-full"
                >
                  {language.name}
                </p>
              </li>
            {/each}
          </ul>
        </Dropdown>
      </div>

      <div id="gas-settings" class="mb-4">
        <p class="opacity-50 mb-3">Default Gas</p>
        <div class="flex flex-row justify-between gap-4">
          {#each Object.entries($global.gasPrices) as gas}
            <GasCard
              cardColor="{$global.gasColor[`${gas[0]}`]}"
              description="{gas[0]}"
              gasFee="{$global.gasPrices[`${gas[0]}`]}"
              isActive="{$settings.defaultGas === gas[0]}"
              on:gasSelected="{() => setGas(gas[0])}"
            />
          {/each}
        </div>
      </div>

      <div id="perms-settings">
        <p class="opacity-50 mb-3">Permissions</p>
        {#if !$account.signer}
          <Button
            borderSize="1"
            label="Connect Wallet to check permissions"
            uppercase="{true}"
            height="h-8"
            on:clicked="{connect}"
          />
        {:else}
          soontm
        {/if}
      </div>
    </div>
  </BorderContainer>
</ViewContainer>
