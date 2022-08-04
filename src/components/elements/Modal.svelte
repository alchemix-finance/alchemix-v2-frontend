<script>
  import { fly } from 'svelte/transition';
  import { modal, modalReset } from '@stores/modal';
  import { fade } from 'svelte/transition';
  import settings from '@stores/settings';

  function onClickBackground(e) {
    if (e.target !== this) return;
    modalReset();
  }

  function onOutroStart(e) {
    e.target.style.pointerEvents = 'none';
  }
</script>

{#if $modal.component}
  <div
    on:click="{onClickBackground}"
    class="fixed inset-0 {$settings.invertColors
      ? 'bg-grey30inverse'
      : 'bg-grey30'} bg-opacity-50 firefox:bg-opacity-50 filter drop-shadow-xl backdrop-filter firefox:backdrop-filter backdrop-blur firefox:backdrop-blur z-20 flex justify-center items-center"
    transition:fade
    on:outrostart="{onOutroStart}"
  >
    <div class="w-1/3" transition:fly="{{ y: -200, duration: 350 }}">
      <svelte:component this="{$modal.component}" {...$modal.props} />
    </div>
  </div>
{/if}

<slot />
