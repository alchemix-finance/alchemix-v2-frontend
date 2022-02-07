<script>
  import { _ } from 'svelte-i18n';
  import Button from '../components/elements/Button.svelte';
  import Dropdown from '../components/elements/Dropdown.svelte';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import BorderContainer from '../components/elements/BorderContainer.svelte';
  import GasCard from '../components/elements/GasCard.svelte';
  import global from '../stores/global';
  import settings from '../stores/settings';
  import account from '@stores/account';
  import { setCurrency, setLanguage, setGas, setVerbose } from '../helpers/userSettings';
  import { connect } from '../helpers/walletManager';

  const debugging = Boolean(parseInt(process.env.DEBUG_MODE));
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
    <span class="ml-4">{$_('settings')}</span>
  </div>
  <BorderContainer>
    <div class="bg-grey10 rounded p-8">
      {#if debugging}
        <div class="mb-4">
          <p class="opacity-50 mb-3">Developer</p>
          <div class="grid grid-cols-3 mb-3">
            <p>Verbose Console Logging</p>
            <div>
              <Dropdown>
                <div
                  slot="label"
                  class="h-8 px-3 py-1 flex items-center text-opacity-50 hover:text-opacity-100 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border border-lightgrey20 text-white2 bg-grey10 hover:bg-grey1"
                >
                  <p class="mr-3 w-full text-center">{$settings.verboseConsole}</p>
                  <p>▾</p>
                </div>
                <ul class="w-max" slot="options">
                  <li
                    class="cursor-pointer h-8 px-3 py-1 hover:bg-grey10"
                    on:click="{() => setVerbose(false)}"
                  >
                    <p class="text-center text-opacity-50 hover:text-opacity-100 w-full">False</p>
                  </li>
                  <li
                    class="cursor-pointer h-8 px-3 py-1 hover:bg-grey10"
                    on:click="{() => setVerbose(true)}"
                  >
                    <p class="text-center text-opacity-50 hover:text-opacity-100 w-full">True</p>
                  </li>
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>
      {/if}
      <div id="locale-settings" class="mb-4">
        <p class="opacity-50 mb-3">{$_('settings_page.locale')}</p>
        <div class="grid grid-cols-3 mb-3">
          <p>{$_('settings_page.base_currency')}</p>
          <div>
            <Dropdown>
              <div
                slot="label"
                class="h-8 px-3 py-1 flex items-center text-opacity-50 hover:text-opacity-100 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border border-lightgrey20 text-white2 bg-grey10 hover:bg-grey1"
              >
                <p class="mr-3 w-full text-center">
                  {$settings.baseCurrency?.symbol}
                </p>
                <p>▾</p>
              </div>
              <ul slot="options" class="w-max">
                {#each $global.allCurrencies as currency}
                  <li
                    class="cursor-pointer h-8 px-3 py-1 hover:bg-grey10"
                    on:click="{() => setCurrency(currency)}"
                  >
                    <p class="text-center text-opacity-50 hover:text-opacity-100 w-full">
                      {currency.symbol}
                    </p>
                  </li>
                {/each}
              </ul>
            </Dropdown>
          </div>
        </div>
        <div class="grid grid-cols-3">
          <p>{$_('settings_page.languages')}</p>
          <div>
            <Dropdown>
              <div
                slot="label"
                class="h-8 px-3 py-1 flex items-center text-opacity-50 hover:text-opacity-100 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border border-lightgrey20 text-white2 bg-grey10 hover:bg-grey1"
              >
                <p class="mr-3 w-full text-center">
                  {$settings.userLanguage?.name}
                </p>
                <p>▾</p>
              </div>
              <ul slot="options" class="w-max">
                {#each $global.languages as language}
                  <li
                    class="cursor-pointer h-8 px-3 py-1 hover:bg-grey10"
                    on:click="{() => setLanguage(language)}"
                  >
                    <p class="text-center text-opacity-50 hover:text-opacity-100 w-full">
                      {language.name}
                    </p>
                  </li>
                {/each}
              </ul>
            </Dropdown>
          </div>
        </div>
      </div>

      <div id="gas-settings" class="mb-4">
        <p class="opacity-50 mb-3">{$_('settings_page.default_gas')}</p>
        <div class="grid grid-cols-3 gap-4">
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
        <p class="opacity-50 mb-3">{$_('settings_page.permissions')}</p>
        {#if !$account.signer}
          <Button
            borderSize="1"
            label="{$_('settings_page.button_label')}"
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
