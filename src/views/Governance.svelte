<script>
import { onMount } from 'svelte';
import { _ } from 'svelte-i18n';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import { getOpenProposals } from '../middleware/snapshot';
import governance from '../stores/governance';
import Button from '../components/elements/Button.svelte';

const openAllOnSnapshot = () => {
  window.open('https://snapshot.org/#/alchemixstakers.eth', '_blank');
};

onMount(() => {
  getOpenProposals();
});
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <span class="self-center">{$_('governance_page.title')}</span>
    <Button
      label="{$_('governance_page.openAllOnSnapshot')}"
      borderSize="1"
      height="h-8"
      width="w-max"
      fontSize="text-md"
      on:clicked="{() => openAllOnSnapshot()}"
    />
  </div>
  {#if $governance.fetching}
    <p>{$_('governance_page.loading')}</p>
  {:else if $governance.proposals.length > 0}
    <ul>
      {#each $governance.proposals as proposal}
        <li>{proposal.title}</li>
      {/each}
    </ul>
  {:else}
    {$_('governance_page.noOpenVotes')}
  {/if}
</ViewContainer>
