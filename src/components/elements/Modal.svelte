<script>
import { modal, hideModal } from 'stores/modal';
import { fade } from 'svelte/transition';

function onClickBackground(e) {
  if (e.target !== this) return;
  hideModal();
}

function onOutroStart(e) {
  e.target.style.pointerEvents = 'none';
}
</script>

{#if $modal.component}
  <div
    on:click="{onClickBackground}"
    class="fixed inset-0 bg-grey30 bg-opacity-90 z-20 flex justify-center items-center"
  >
    <div class="w-1/3" transition:fade on:outrostart="{onOutroStart}">
      <svelte:component this="{$modal.component}" {...$modal.props} />
    </div>
  </div>
{/if}

<slot />
