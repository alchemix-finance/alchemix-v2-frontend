<script>
import { createEventDispatcher } from 'svelte';

export let visible = false;
export let title;

const dispatch = createEventDispatcher();

const keyHandler = (event) => {
  console.log(event);
  if (event.key === 'Escape') {
    closeModal();
  }
};

const closeModal = () => {
  dispatch('closeModal');
};
</script>

{#if visible}
  <div class="fixed z-10 inset-0 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="flex items-start mt-40 justify-center min-h-screen">
      <div
        class="py-8 px-4 inline-block align-bottom bg-grey10 border-2 border-grey5 rounded-lg overflow-hidden shadow-xl"
      >
        <p class="inline-block">{title}</p>
        <p class="inline-block text-right" on:click="{() => closeModal()}">&times;</p>
        <div>
          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}
