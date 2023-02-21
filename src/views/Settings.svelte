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

  function escapeSemicolon(msg) {
    let newString = '';
    for (const sChar of msg) {
      newString += sChar === ';' ? '%3B' : sChar;
    }
    return newString;
  }

  const createBugReport = (bug) => {
    const title = `${bug.message.slice(0, 64)}${bug.message.length > 64 ? '...' : ''}`;
    window.open(
      `https://github.com/alchemix-finance/alchemix-v2-frontend/issues/new?assignees=&labels=bug&template=BUG-REPORT.yml&title=%5BBUG%5D+${escapeSemicolon(
        title,
      )}&description=${escapeSemicolon(bug.message)}`,
      '_blank',
    );
    setSuccess('Generated Bug Report');
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
          {#each Object.entries($global.gasPrices).filter((entry) => entry[0] !== 'eip1559') as gas}
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
            {#each $errorLog.sort((a, b) => {
              return b.timeStamp - a.timeStamp;
            }) as error}
              <div class="flex flex-row space-x-4">
                <div class="flex flex-col space-y-4">
                  <div
                    class="rounded border border-white2 p-2 cursor-pointer hover:{$settings.invertColors
                      ? 'bg-grey1inverse'
                      : 'bg-grey1'}"
                    on:click="{() => copyError(error)}"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      ></path>
                    </svg>
                  </div>
                  <div
                    class="rounded border border-red1 p-2 cursor-pointer hover:{$settings.invertColors
                      ? 'bg-grey1inverse'
                      : 'bg-grey1'}"
                    on:click="{() => createBugReport(error)}"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6 text-red1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      ></path>
                    </svg>
                  </div>
                </div>

                <div class="w-full grid grid-cols-12 rounded border border-red1 py-4 px-6">
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
