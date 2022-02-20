<script>
  import { fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';
  import Button from '../components/elements/Button.svelte';
  import BorderContainer from '../components/elements/BorderContainer.svelte';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import settings from '../stores/settings';
  import global from '../stores/global';
  import { routerGuard } from '@helpers/routerGuard.js';

  let videoPlaying = false;

  const playVideo = () => {
    videoPlaying = !videoPlaying;
  };

  const assets = [
    {
      name: 'ETH',
      ltv: '50',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    {
      name: 'DAI',
      ltv: '50',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    {
      name: 'USDC',
      ltv: '50',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      name: 'USDT',
      ltv: '50',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
  ];

  const getPrice = (address) => {
    const price =
      $global.tokenPrices.find((token) => token.address.toLowerCase() === address.toLowerCase())?.price *
      $global.conversionRate;
    return new Intl.NumberFormat($settings.userLanguage.locale, {
      style: 'currency',
      currency: $settings.baseCurrency.symbol,
    }).format(parseFloat(((price || 0) * $global.conversionRate).toFixed(2)));
  };

  let carouselItems = ['intro_subtitle_0', 'intro_subtitle_1', 'intro_subtitle_2'];
  let carouselItem = carouselItems[0];

  let carouselTimer;

  function carousel() {
    carouselTimer = setTimeout(() => {
      const index = carouselItems.findIndex((entry) => entry === carouselItem);
      const isLast = index + 1 === carouselItems.length;
      if (isLast) {
        carouselItem = carouselItems[0];
      } else {
        carouselItem = carouselItems[index + 1];
      }
      carousel();
    }, 5000);
  }

  onMount(() => {
    carousel();
  });

  onDestroy(() => {
    clearTimeout(carouselTimer);
  });
</script>

<ViewContainer>
  <div class="flex flex-col space-y-14">
    <div class="text-center text-5xl font-alcxTitles leading-tight font-medium mt-12">
      <span
        style="color: transparent"
        class="bg-clip-text bg-gradient-to-r from-orange4 via-white2 to-orange4"
      >
        {$_('landing.intro_title')}
      </span>
    </div>

    <p class="text-center opacity-50 font-alcxTitles font-medium text-3xl" transition:fade>
      {$_(`landing.${carouselItem}`)}
    </p>

    <div class="flex justify-center text-bronze4">
      <button
        class="h-max
        w-max
        font-medium
        p-4
        text-xl
        rounded-lg
        border-2
        border-bronze2
        transition-all
        duration-500
        bg-gradient-to-br
        to-orange4
        from-orange4
        via-white2
        bg-size-200
        bg-pos-0
        hover:bg-pos-100"
        on:click="{() => routerGuard('accounts')}"
      >
        <span class="flex flex-row space-x-4 self-center content-center h-max">
          <span class="self-center">{$_('landing.button_label')}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 self-center"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"
            ></path>
          </svg>
        </span>
      </button>
    </div>

    <div class="w-full flex relative justify-center text-orange4 h-auto overflow-hidden" style="height:405px">
      <img
        src="/images/landing-page/ad.jpg"
        class:filter="{videoPlaying}"
        class:blur-md="{videoPlaying}"
        alt="Watch the Alchemix cinematic ad"
        class="w-full transition-all"
      />

      {#if videoPlaying}
        <div class="absolute w-full flex justify-center text-white2" style="height:405px;" transition:fade>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-24 w-24 absolute top-8 right-8 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            on:click="{() => playVideo()}"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
          <iframe
            class="absolute self-center"
            width="720"
            height="405"
            src="https://www.youtube.com/embed/FlWP9FC8C3c?autoplay=1"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      {:else}
        <svg
          role="img"
          class="w-32 h-32 cursor-pointer absolute self-center opacity-50 transition-all hover:opacity-100"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          on:click="{() => playVideo()}"
          transition:fade
        >
          <path
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
          ></path>
        </svg>
      {/if}
    </div>

    <p class="text-center font-alcxFlow text-lg opacity-75">{$_('landing.short_explainer')}</p>

    <div class="w-full flex flex-col">
      <p class="text-center font-alcxTitles text-3xl opacity-75">{$_('landing.path_headline')}</p>
      <p class="text-center text-lg opacity-75">{$_('landing.path_subtitle')}</p>
      <img
        class="w-3/4 self-center"
        src="/images/landing-page/diagram.svg"
        alt="A diagram depicting the possibilities of Alchemix"
      />
      <a class="text-center underline" href="https://alchemix-finance.gitbook.io/alchemix-finance/"
        >{$_('landing.learn_more')}</a
      >
    </div>

    <div class="w-full border-t border-b border-grey5 flex flex-col space-y-4 py-8">
      <p class="text-center font-alcxTitles text-3xl opacity-75">{$_('landing.leverage_headline')}</p>
      <div class="flex flex-row space-x-4 justify-center">
        {#each assets as asset}
          <div class="flex flex-row space-x-4 w-max border border-grey1 bg-grey15 p-4 rounded-lg">
            <img src="/images/icons/{asset.name.toLowerCase()}.svg" class="w-16" alt="{asset.name} Logo" />
            <div>
              <p>{asset.name}</p>
              <p>
                {getPrice(asset.address)}
              </p>
              <p>{asset.ltv}% LTV</p>
            </div>
          </div>
        {/each}
      </div>
      <a class="text-center underline" href="https://alchemix-finance.gitbook.io/alchemix-finance/"
        >{$_('landing.learn_more')}</a
      >
    </div>

    <div class="w-full flex flex-col space-y-4">
      <p class="text-center font-alcxTitles text-3xl opacity-75">{$_('landing.benefits_headline')}</p>
      <div class="flex flex-row w-full">
        <div class="flex-1 p-4 pb-16 border border-grey1 bg-grey15 flex flex-col space-y-4 relative">
          <p class="text-2xl font-light font-alcxTitles text-orange4">
            {$_('landing.benefit_leverage_title')}
          </p>
          <p class="font-light text-lg opacity-75 mb">{$_('landing.benefit_leverage_blurb')}</p>
          <a
            href="https://alchemix-finance.gitbook.io/alchemix-finance/"
            class="text-center absolute bottom-4 inset-x-0">{$_('landing.learn_more')}</a
          >
        </div>
        <div class="flex-1 p-4 pb-16 border border-grey1 bg-grey15 flex flex-col space-y-4 relative">
          <p class="text-2xl font-light font-alcxTitles text-orange4">{$_('landing.benefit_range_title')}</p>
          <p class="font-light text-lg opacity-75">{$_('landing.benefit_range_blurb')}</p>
          <a
            href="https://alchemix-finance.gitbook.io/alchemix-finance/"
            class="absolute bottom-4 inset-x-0 text-center">{$_('landing.learn_more')}</a
          >
        </div>
        <div class="flex-1 p-4 pb-16 border border-grey1 bg-grey15 flex flex-col space-y-4 relative">
          <p class="text-2xl font-light font-alcxTitles text-orange4">
            {$_('landing.benefit_liquidations_title')}
          </p>
          <p class="font-light text-lg opacity-75">{$_('landing.benefit_liquidations_blurb')}</p>
          <a
            href="https://alchemix-finance.gitbook.io/alchemix-finance/"
            class="text-center absolute inset-x-0 bottom-4">{$_('landing.learn_more')}</a
          >
        </div>
        <div class="flex-1 p-4 pb-16 border border-grey1 bg-grey15 flex flex-col space-y-4 relative">
          <p class="text-2xl font-light font-alcxTitles text-orange4">
            {$_('landing.benefit_flexible_title')}
          </p>
          <p class="font-light text-lg opacity-75">{$_('landing.benefit_flexible_blurb')}</p>
          <a
            href="https://alchemix-finance.gitbook.io/alchemix-finance/"
            class="text-center absolute bottom-4 inset-x-0">{$_('landing.learn_more')}</a
          >
        </div>
      </div>
    </div>

    <div class="flex justify-center text-bronze4">
      <button
        class="h-max
        w-max
        font-medium
        p-4
        text-xl
        rounded-lg
        border-2
        border-bronze2
        transition-all
        duration-500
        bg-gradient-to-br
        to-orange4
        from-orange4
        via-white2
        bg-size-200
        bg-pos-0
        hover:bg-pos-100"
        on:click="{() => routerGuard('accounts')}"
      >
        <span class="flex flex-row space-x-4 self-center content-center h-max">
          <span class="self-center">{$_('landing.button_label')}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 self-center"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"
            ></path>
          </svg>
        </span>
      </button>
    </div>
  </div>
</ViewContainer>
