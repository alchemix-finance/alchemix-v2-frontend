<script>
import { onMount } from 'svelte';
import { _ } from 'svelte-i18n';
import { getProposalVotes, sendVote } from '../../../../middleware/snapshot';
import governance from '../../../../stores/governance';
import Button from '../../../elements/Button.svelte';
import DropdownOnClick from '../../../elements/DropdownOnClick.svelte';
export let expandedRow = {};
let value = '';
let proposal;

/*
 * @dev constructs a payload and initiates snapshot voting
 * */
const initVote = () => {
  const payload = {
    proposal: expandedRow.proposalEntry.id,
    choice: value,
  };
  sendVote(payload);
};

const openOnSnapshot = () => {
  window.open(`https://snapshot.org/#/alchemixstakers.eth/proposal/${proposal.id}`, '_blank');
};

onMount(async () => {
  if (!expandedRow.proposalEntry?.results) {
    await getProposalVotes(expandedRow.proposalEntry.id);
  }
});

$: proposal = $governance.proposals?.find((proposal) => proposal.id === expandedRow.proposalEntry.id);

$: console.log(proposal);
</script>

<div class="border-l-2 border-bronze2 pb-4">
  <div class="wrapper max-w-none grid grid-cols-6">
    <div class="col-span-1"></div>
    <div class="col-span-3 pr-4">
      <p class="mb-3 opacity-50">{$_('governance_page.description')}</p>
      <p>
        {@html proposal?.body}
      </p>
    </div>
    <div class="col-span-2 pr-4">
      <p class="mb-3 opacity-50">
        {$_('governance_page.results')}
      </p>
      {#each proposal?.choices as choice, index}
        <div class="wrapper grid grid-cols-2 mb-2">
          <p class="col-span-1 text-left">{choice}</p>
          <p class="col-span-1 text-right">{proposal.results?.[index] || '0'}</p>
        </div>
        <div class="mb-4 text-center">
          {((100 / proposal.results?.total) * proposal.results?.[index]).toFixed(2) || '0'}%
        </div>
      {/each}
    </div>
  </div>
  <div class="wrapper max-w-none grid grid-cols-6">
    <div class="col-span-1"></div>
    <div class="col-span-3">
      <Button
        label="{$_('governance_page.openOnSnapshot')}"
        borderSize="1"
        height="h-8"
        width="w-max"
        fontSize="text-md"
        on:clicked="{() => openOnSnapshot()}"
      />
    </div>
    <div class="col-span-2">
      <select bind:value class="border border-grey5 bg-grey1 h-8 rounded p-1 text-xs">
        <option value="null" selected disabled>
          {$_('governance_page.selectChoice')}
        </option>
        {#each proposal.choices as choice, index}
          <option value="{index + 1}">{choice}</option>
        {/each}
      </select>

      <Button
        label="{$_('governance_page.castVote')}"
        borderSize="1"
        height="h-8"
        width="w-max"
        fontSize="text-md"
        borderColor="green3"
        textColor="green3"
        hoverColor="darkgreen2"
        backgroundColor="darkgreen1"
        on:clicked="{() => initVote()}"
      />
    </div>
  </div>
</div>
