<script>
import Button from '../../../elements/Button.svelte';

export let actions = [];

const goToExternal = (link) => {
  window.open(link, '_blank');
};
</script>

<div class="grid grid-cols-{actions.length} gap-6">
  {#each actions as action}
    <div class="col-span-1">
      <Button label="{action.label}" on:clicked="{() => goToExternal(action.url)}" />
    </div>
  {/each}
</div>
