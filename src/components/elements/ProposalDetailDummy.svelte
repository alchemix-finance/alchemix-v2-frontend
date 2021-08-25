<script>
import settings from '../../stores/settings';
import BorderContainer from './BorderContainer.svelte';
import { getProposalVotes } from '../../middleware/snapshot';
export let proposalEntry = {};
let viewDetail = false;

/*
 * @dev transforms snapshot's block notation to human readable date
 * @param snapshotBlock the block number
 * */
const snapshotToDate = (snapshotBlock) => {
  return new Date(snapshotBlock * 1e3).toLocaleDateString(
    $settings.userLanguage.locale,
  );
};

const getVoteDetails = () => {
  if (!viewDetail) {
    getProposalVotes(proposalEntry.id);
  }
  viewDetail = !viewDetail;
};
</script>

<p
  on:click="{getVoteDetails}"
  class="cursor-pointer hover:bg-grey10 {viewDetail ? 'bg-grey10' : ''}"
>
  {proposalEntry?.title}
</p>

{#if viewDetail}
  <BorderContainer>
    <div class="py-2 px-4 bg-grey10 rounded">
      <p class="mb-3">
        {@html proposalEntry?.body}
      </p>
      <p>Start {snapshotToDate(proposalEntry.start)}</p>
      <p>End {snapshotToDate(proposalEntry.end)}</p>
      <p>
        <a
          href="https://etherscan.io/block/{proposalEntry.snapshot}"
          target="_blank"
        >
          Snapshot Block
        </a>
      </p>
      <p>
        <a
          href="https://cloudflare-ipfs.com/ipfs/{proposalEntry.id}"
          target="_blank">IPFS Link</a
        >
      </p>
      <ul>
        <li>Choices:</li>
        {#each proposalEntry.choices as choice, index}
          <li>
            {choice}
            {proposalEntry.results?.[index]}
            (~{Math.floor(
              (100 / proposalEntry.results?.total) *
                proposalEntry.results?.[index],
            )}%)
          </li>
        {/each}
        <li>Total votes: {proposalEntry.results?.total}</li>
      </ul>
    </div>
  </BorderContainer>
{/if}
