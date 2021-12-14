<script context="module">
export function bind(Component, props = {}) {
  return function ModalComponent(options) {
    return new Component({
      ...options,
      props: {
        ...props,
        ...options.props,
      },
    });
  };
}
</script>

<script>
export let visible;
export let title;
export let message;
</script>

{#if visible}
  <div class="fixed z-10 inset-0 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="flex items-start mt-40 justify-center min-h-screen">
      <div
        class="py-8 px-4 inline-block align-bottom bg-grey10 border-2 border-grey5 rounded-lg overflow-hidden shadow-xl"
      >
        <p class="inline-block">{title}</p>
        <div>
          <p>{message}</p>
        </div>
      </div>
    </div>
  </div>
{/if}
