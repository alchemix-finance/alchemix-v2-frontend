<script>
import settings from '../../stores/settings';
import BorderContainer from './BorderContainer.svelte';
import { getProposalVotes, sendVote } from '../../middleware/snapshot';
export let proposalEntry = {};
let viewDetail = false;
let value = '';

/*
 * @dev transforms snapshot's block notation to human readable date
 * @param snapshotBlock the block number
 * */
const snapshotToDate = (snapshotBlock) => {
  return new Date(snapshotBlock * 1e3).toLocaleDateString($settings.userLanguage.locale);
};

/*
 * @dev expands the detail view and queries votes
 * */
const getVoteDetails = () => {
  if (!viewDetail) {
    getProposalVotes(proposalEntry.id);
  }
  viewDetail = !viewDetail;
};

/*
 * @dev constructs a payload and initiates snapshot voting
 * */
const initializeVote = () => {
  const payload = {
    proposal: proposalEntry.id,
    choice: value + 1,
  };
  sendVote(payload);
};
</script>

<p on:click="{getVoteDetails}" class="cursor-pointer hover:bg-grey10 {viewDetail ? 'bg-grey10' : ''}">
  {proposalEntry?.title}
</p>

{#if viewDetail}
  <BorderContainer>
    <div class="py-2 px-4 bg-grey10 rounded">
      <p on:click="{getVoteDetails}">Close detail view</p>
      <p class="mb-3">
        {@html proposalEntry?.body}
      </p>
      <p>Start {snapshotToDate(proposalEntry.start)}</p>
      <p>End {snapshotToDate(proposalEntry.end)}</p>
      <p>
        <a href="https://etherscan.io/block/{proposalEntry.snapshot}" target="_blank"> Snapshot Block </a>
      </p>
      <p>
        <a href="https://cloudflare-ipfs.com/ipfs/{proposalEntry.id}" target="_blank">IPFS Link</a>
      </p>
      <ul class="mb-3">
        <li>Choices:</li>
        {#each proposalEntry.choices as choice, index}
          <li>
            {choice}
            {proposalEntry.results?.[index]}
            (~{((100 / proposalEntry.results?.total) * proposalEntry.results?.[index]).toFixed(2)}%)
          </li>
        {/each}
        <li>Total votes: {proposalEntry.results?.total}</li>
      </ul>
      <p>Your vote: {value}</p>
      <select bind:value>
        <option value="null" selected disabled>Select your choice</option>
        {#each proposalEntry.choices as choice, index}
          <option value="{index}">{choice}</option>
        {/each}
      </select>
      <button on:click="{initializeVote}">Send vote</button>
    </div>
  </BorderContainer>
  <div class="flex justify-between mb-6">
    <a href="https://snapshot.org/#/alchemixstakers.eth/proposal/{proposalEntry.id}" target="_blank"
      >View proposal on Snapshot</a
    >
  </div>
{/if}
