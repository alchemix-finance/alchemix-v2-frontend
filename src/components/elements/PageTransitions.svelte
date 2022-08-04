<script>
  import { fade } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte';
  import { globalHistory } from 'svelte-routing/src/history';

  let pathname = window.location.pathname;
  let unsub;

  onMount(() => {
    unsub = globalHistory.listen(({ location }) => {
      pathname = location.pathname;
    });
  });

  onDestroy(() => {
    unsub();
  });
</script>

{#key pathname}
  <div>
    <slot />
  </div>
{/key}
