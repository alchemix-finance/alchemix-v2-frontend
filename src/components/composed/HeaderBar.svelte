<script>
  import { Link, navigate } from 'svelte-routing';
  import { connect, disconnect } from '@helpers/walletManager';
  // import { setCurrency, setGas } from '@helpers/userSettings';
  import { _ } from 'svelte-i18n';

  import governance from '@stores/governance';
  import account from '@stores/account';
  import settings from '../../stores/settings';
  // import global from '../../stores/global';
  import toastConfig from '../../stores/toast.js';
  import backgroundLoading from '../../stores/backgroundLoading';
  import Toast from '../elements/Toast.svelte';
  import Dropdown from '../elements/Dropdown.svelte';
  // import GasCard from '../elements/GasCard.svelte';
  import LoadingIndicator from '../elements/LoadingIndicator.svelte';
  // import * as LottiePlayer from '@lottiefiles/lottie-player';

  let _governance;
  governance.subscribe((val) => {
    _governance = val;
  });

  function goToSettings() {
    if (window.location.pathname.slice(1) !== 'settings') {
      navigate(`/settings`, { replace: false });
    }
  }

  const goToHelp = () => {
    window.open('https://alchemix-finance.gitbook.io/v2/', '_blank');
  };

  const reportBug = () => {
    window.open(
      'https://github.com/alchemix-finance/alchemix-v2-frontend/issues/new?assignees=&labels=bug&template=BUG-REPORT.yml&title=%5BBUG%5D+',
      '_blank',
    );
  };

  const userGas = (selector) => {
    return typeof selector === 'number' ? selector : selector.baseFeePerGas + selector.maxPriorityFeePerGas;
  };

  const goToVote = () => {
    _governance.activeVotes = $governance.activeVotes.map((prop) => {
      return {
        id: prop.id,
        mute: prop.mute ? prop.mute : true,
      };
    });
    governance.set({ ..._governance });
    if (window.location.pathname.slice(1) !== 'governance') {
      navigate('/governance', { replace: false });
    }
  };

  $: hasActiveVotes = $governance.activeVotes.filter((prop) => !prop.mute).length > 0;
</script>

<Toast
  isOpen="{$toastConfig.visible}"
  kind="{$toastConfig.kind}"
  title="{$toastConfig.title}"
  subTitle="{$toastConfig.subtitle}"
  showSpinner="{$toastConfig.spinner}"
  showOpenButton="{$toastConfig.showOpenButton}"
  showCloseButton="{$toastConfig.showCloseButton}"
  closeTimeoutMs="{$toastConfig.closeTimeout}"
  closeOnMount="{$toastConfig.closeOnMount}"
  forceCloseToast="{$toastConfig.forceClose}"
/>
<div class="flex flex-col md:flex-row gap-5 p-4 md:p-0 items-center justify-center md:justify-between">
  <div class="flex-1 flex items-center">
    <Link to="/">
      <div class="flex-shrink-0 flex items-center">
        <img
          src="./images/icons/ALCX_Std_logo.svg"
          class="h-11 {$settings.invertColors ? 'invertIcons' : ''}"
          alt="The Alchemix logo"
        />
      </div>
    </Link>
  </div>
  <div class="inset-y-0 right-0 flex flex-row items-center gap-2 p-3 md:p-0 md:pr-8">
    {#if $backgroundLoading.active}
      <LoadingIndicator />
    {/if}

    <div
      class="h-8
        pl-3
        pr-1
        flex
        flex-row
        items-center
        text-opacity-50
        hover:text-opacity-100
        {hasActiveVotes ? 'hover:cursor-pointer' : ''}
        select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border {$settings.invertColors
        ? 'border-grey5inverse text-white2inverse bg-grey10inverse hover:bg-grey1inverse'
        : 'border-grey5 text-white2 bg-grey10 hover:bg-grey1'}"
      role="none"
      on:click="{() => goToVote()}"
    >
      <div class="relative">
        {#if hasActiveVotes}
          <div class="absolute w-2.5 h-2.5 rounded-full bg-red3 left-0 animate-ping"></div>
          <div
            class="absolute w-2.5 h-2.5 rounded-full bg-red3 left-0 border-2 {$settings.invertColors
              ? 'border-grey10inverse'
              : 'border-grey10'}"
          ></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="#DC1D1D"
            class="h-5 w-5 mr-2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5"
            ></path>
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5 mr-2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            ></path>
          </svg>
        {/if}
      </div>
    </div>

    <!--    <Dropdown>-->
    <!--      <div-->
    <!--        slot="label"-->
    <!--        class="h-8 px-3 py-1 flex items-center text-opacity-50 hover:text-opacity-100 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border {$settings.invertColors-->
    <!--          ? 'border-grey5inverse text-white2inverse bg-grey10inverse hover:bg-grey1inverse'-->
    <!--          : 'border-grey5 text-white2 bg-grey10 hover:bg-grey1'}"-->
    <!--      >-->
    <!--        <svg-->
    <!--          stroke="currentColor"-->
    <!--          fill="currentColor"-->
    <!--          stroke-width="0"-->
    <!--          viewBox="0 0 24 24"-->
    <!--          class="h-5 w-5 mr-2"-->
    <!--          height="1.2em"-->
    <!--          width="1.2em"-->
    <!--          xmlns="http://www.w3.org/2000/svg"-->
    <!--        >-->
    <!--          <g>-->
    <!--            <path fill="none" d="M0 0h24v24H0z"></path>-->
    <!--            <path-->
    <!--              d="M3 19V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v8h2a2 2 0 0 1 2 2v4a1 1 0 0 0 2 0v-7h-2a1 1 0 0 1-1-1V6.414l-1.657-1.657 1.414-1.414 4.95 4.95A.997.997 0 0 1 22 9v9a3 3 0 0 1-6 0v-4h-2v5h1v2H2v-2h1zM5 5v6h7V5H5z"-->
    <!--            ></path>-->
    <!--          </g>-->
    <!--        </svg>-->
    <!--        <p class="mr-2">-->
    <!--          {userGas($global.gasPrices[`${$settings.defaultGas}`])}-->
    <!--        </p>-->
    <!--        <p>▾</p>-->
    <!--      </div>-->
    <!--      <div slot="options" class="flex flex-col gap-4 justify-between w-60 p-4">-->
    <!--        {#each Object.entries($global.gasPrices).filter((entry) => entry[0] !== 'eip1559') as gas}-->
    <!--          <GasCard-->
    <!--            cardColor="{$global.gasColor[`${gas[0]}`]}"-->
    <!--            description="{gas[0]}"-->
    <!--            gasFee="{gas[1]}"-->
    <!--            isActive="{$settings.defaultGas === gas[0]}"-->
    <!--            compactView="{true}"-->
    <!--            on:gasSelected="{() => setGas(gas[0])}"-->
    <!--          />-->
    <!--        {/each}-->
    <!--      </div>-->
    <!--    </Dropdown>-->

    <Dropdown>
      <div
        class="h-8
        px-3
        flex
        flex-row
        items-center
        text-opacity-50
        hover:text-opacity-100
        select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border {$settings.invertColors
          ? 'border-grey5inverse text-white2inverse bg-grey10inverse hover:bg-grey1inverse'
          : 'border-grey5 text-white2 bg-grey10 hover:bg-grey1'}"
        slot="label"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
        <p>▾</p>
      </div>
      <ul slot="options" class="w-40">
        <li
          class="cursor-pointer h-8 {$settings.invertColors
            ? 'hover:bg-grey10inverse border-grey10inverse'
            : 'hover:bg-grey10 border-grey10'}"
          role="none"
          on:click="{goToSettings}"
        >
          <p class="text-center">{$_('settings')}</p>
        </li>
        <li
          class="cursor-pointer h-8 border-t {$settings.invertColors
            ? 'hover:bg-grey10inverse border-grey10inverse'
            : 'hover:bg-grey10 border-grey10'}"
          role="none"
          on:click="{() => goToHelp()}"
        >
          <p class="text-center">{$_('help')}</p>
        </li>
        <li
          class="cursor-pointer h-8 border-t {$settings.invertColors
            ? 'hover:bg-grey10inverse border-grey10inverse'
            : 'hover:bg-grey10 border-grey10'}"
          role="none"
          on:click="{() => reportBug()}"
        >
          <p class="text-center">{$_('report_bug')}</p>
        </li>
        <li
          class="cursor-pointer h-8 {$settings.invertColors
            ? 'hover:bg-grey10inverse border-grey10inverse'
            : 'hover:bg-grey10 border-grey10'}"
          role="none"
          on:click="{$account.signer ? disconnect : connect}"
        >
          <p class="text-center">
            {$account.signer ? $_('disconnect') : $_('connect')}
          </p>
        </li>
      </ul>
    </Dropdown>
  </div>
</div>
