<script>
import { onMount } from 'svelte';
import { _ } from 'svelte-i18n';
import { BarLoader } from 'svelte-loading-spinners';

import ViewContainer from '../components/elements/ViewContainer.svelte';
import SidebarLayout from '../components/composed/Layouts/SidebarLayout.svelte';
import { getOpenProposals } from '../middleware/snapshot';
import governance from '../stores/governance';
import Button from '../components/elements/Button.svelte';
import ProposalDetailDummy from '../components/elements/ProposalDetailDummy.svelte';

const openAllOnSnapshot = () => {
  window.open('https://snapshot.org/#/alchemixstakers.eth', '_blank');
};

onMount(() => {
  if ($governance.proposals.length === 0) {
    getOpenProposals();
  }
});
</script>

<SidebarLayout>
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
      <p class="text-center">{$_('governance_page.loading')}</p>
      <div class="flex justify-center">
        <BarLoader color="#F5C59F" />
      </div>
    {:else if $governance.proposals.length > 0}
      <p class="text-center text-xs mb-6 opacity-50">
        {$_('governance_page.noTranslation')}
      </p>
      <ul>
        {#each $governance.proposals as proposal}
          <li class="mb-3">
            <ProposalDetailDummy proposalEntry="{proposal}" />
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-center opacity-50">
        {$_('governance_page.noOpenVotes')}
      </p>
    {/if}
  </ViewContainer>
</SidebarLayout>
