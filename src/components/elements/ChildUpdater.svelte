<script>
// taken from https://svelte.dev/repl/2373af8e5b5448c1821ceffe95bd3f26?version=3.15.0
export let key;
const items = [0];
</script>

{#each items as x (key)}
  <slot />
{/each}
