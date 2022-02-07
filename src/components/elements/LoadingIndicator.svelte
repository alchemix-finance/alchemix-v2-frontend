<script>
  import { onMount, onDestroy } from 'svelte';
  import * as LottiePlayer from '@lottiefiles/lottie-player';
  import backgroundLoading from '../../stores/backgroundLoading';

  let startStamp;
  let timer;
  let showRefresh = false;

  const retryPopup = () => {
    timer = setTimeout(() => {
      if ((Date.now() - startStamp) / 1000 > 15) {
        showRefresh = true;
        clearTimeout(timer);
      } else {
        retryPopup();
      }
    }, 200);
  };

  const refresh = () => {
    location.reload();
  };

  onMount(() => {
    startStamp = Date.now();
    retryPopup();
  });
  onDestroy(() => {
    clearTimeout(timer);
    showRefresh = false;
  });
</script>

{#if showRefresh}
  <div class="inline-block relative w-full" on:click="{refresh}">
    <div
      class="h-8 px-3 py-1 flex items-center text-opacity-50 select-none cursor-pointer font-alcxTitles text-xs uppercase rounded border border-red4 text-white2 bg-red2 hover:bg-red4 hover:text-opacity-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        ></path>
      </svg>
      <p class="ml-2">Refresh</p>
    </div>
  </div>
{/if}
<div class="inline-block relative w-full">
  <div
    class="h-8 px-3 py-1 flex items-center text-opacity-50 select-none font-alcxTitles text-xs uppercase rounded overflow-hidden border border-grey5 text-white2 bg-grey10 hover:bg-grey1 hover:text-opacity-100"
  >
    <lottie-player
      src="images/lotties/AlchemixSpinning.json"
      style="width: 1.2rem; height: 1.2rem;"
      autoplay
      loop></lottie-player>
    <p class="ml-2">
      {$backgroundLoading.message}
    </p>
  </div>
</div>
