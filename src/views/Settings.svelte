<script>
  import { _ } from 'svelte-i18n';
  import Button from '../components/elements/Button.svelte';
  import Dropdown from '../components/elements/Dropdown.svelte';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
  import GasCard from '../components/elements/GasCard.svelte';
  import global from '../stores/global';
  import settings from '../stores/settings';
  import errorLog from '../stores/errorLog';
  import { setSuccess } from '@helpers/setToast';
  import { setCurrency, setLanguage, setGas, setInvert } from '@helpers/userSettings';
  import ToggleSwitch from '../components/elements/ToggleSwitch.svelte';

  const switchColorScheme = (event) => {
    setInvert(event.detail.value);
    location.reload();
  };

  const copyError = (message) => {
    navigator.clipboard.writeText(message);
    setSuccess('Error copied to clipboard');
  };

  const clearErrors = () => {
    $errorLog.length = 0;
  };
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

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <p class="py-4 px-6 flex space-x-4" slot="header">
        {$_('settings_page.personalise')}
      </p>
      <div slot="body" class="py-4 px-6">
        <div class="mb-4">
          <p class="opacity-50 mb-3">Theme</p>
          <div class="grid grid-cols-3 mb-3">
            <p>Colorscheme</p>
            <div>
              <ToggleSwitch
                label="Nigredo"
                secondLabel="Albedo"
                forceState="{$settings.invertColors}"
                on:toggleChange="{(event) => switchColorScheme(event)}"
              />
            </div>
          </div>
        </div>
        <div id="locale-settings" class="mb-4">
          <p class="opacity-50 mb-3">{$_('settings_page.locale')}</p>
          <div class="grid grid-cols-3 mb-3">
            <p>{$_('settings_page.base_currency')}</p>
            <div>
              <Dropdown>
                <div
                  slot="label"
                  class="h-8 px-3 py-1 flex items-center text-opacity-50 hover:text-opacity-100 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border {$settings.invertColors
                    ? 'border-lightgrey20inverse text-white2inverse bg-grey10inverse hover:bg-grey1inverse'
                    : 'border-lightgrey20 text-white2 bg-grey10 hover:bg-grey1'}"
                >
                  <p class="mr-3 w-full text-center">
                    {$settings.baseCurrency?.symbol}
                  </p>
                  <p>▾</p>
                </div>
                <ul slot="options" class="w-full">
                  {#each $global.allCurrencies as currency, index}
                    <li
                      class="cursor-pointer h-8 px-3 py-1 {$settings.invertColors
                        ? 'hover:bg-grey10inverse'
                        : 'hover:bg-grey10'} {index + 1 === $global.allCurrencies.length
                        ? ''
                        : `border-b ${$settings.invertColors ? 'border-grey10inverse' : 'border-grey10'}`}"
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
                  class="h-8 px-3 py-1 flex items-center text-opacity-50 hover:text-opacity-100 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border {$settings.invertColors
                    ? 'border-lightgrey20inverse text-white2inverse bg-grey10inverse hover:bg-grey1inverse'
                    : 'border-lightgrey20 text-white2 bg-grey10 hover:bg-grey1'}"
                >
                  <p class="mr-3 w-full text-center">
                    {$settings.userLanguage?.name}
                  </p>
                  <p>▾</p>
                </div>
                <ul slot="options" class="w-full">
                  {#each $global.languages?.sort( (a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0), ) as language, index}
                    <li
                      class="cursor-pointer h-8 px-3 py-1 {$settings.invertColors
                        ? 'hover:bg-grey10inverse'
                        : 'hover:bg-grey10'} {index + 1 === $global.languages.length
                        ? ''
                        : `border-b ${$settings.invertColors ? 'border-grey10inverse' : 'border-grey10'}`}"
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
      </div>
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <p class="py-4 px-6" slot="header">
        {$_('settings_page.default_gas')}
      </p>
      <div class="py-4 px-6" slot="body">
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
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader canToggle="{true}" isVisible="{$errorLog.length > 0}">
      <p class="self-center" slot="header">
        {$_('settings_page.error_log')}
      </p>
      <div class="py-4 px-6" slot="body">
        {#if $errorLog.length > 0}
          <div class="flex flex-col space-y-4">
            <Button
              label="{$_('settings_page.clear_log')}"
              borderSize="1"
              width="w-full"
              height="h-12"
              fontSize="text-md"
              on:clicked="{() => clearErrors()}"
            />
            {#each $errorLog as error}
              <div
                on:click="{() => {
                  copyError(error.message);
                }}"
                class="grid grid-cols-12 rounded border border-red1 py-4 px-6
                 cursor-pointer hover:{$settings.invertColors ? 'bg-grey1inverse' : 'bg-grey1'}"
              >
                <div class="col-span-2">
                  <p class="text-sm">{$_('settings_page.timestamp')}:</p>
                  <code class="mb-4">{error.timeStamp}</code>
                  <p class="text-sm">
                    ({new Date(error.timeStamp).toLocaleDateString($settings.userLanguage.locale)})
                  </p>
                </div>
                <div class="col-span-10">
                  <p class="text-sm">{$_('settings_page.error_msg')}:</p>
                  <div class="w-full overflow-x-scroll">
                    <code>{error.message}</code>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-center">
            {$_('settings_page.no_error')}
          </p>
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
