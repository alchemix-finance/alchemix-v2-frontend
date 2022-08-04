<script>
  import { onMount } from 'svelte';
  import BorderContainer from './BorderContainer.svelte';
  import { getProposalVotes, sendVote } from '../../middleware/snapshot';
  export let expandedRow = {};
  let value = '';
  let votes = {};

  /*
   * @dev constructs a payload and initiates snapshot voting
   * */
  const initializeVote = () => {
    const payload = {
      proposal: expandedRow.proposalEntry.id,
      choice: value + 1,
    };
    sendVote(payload);
  };

  onMount(async () => {
    if (!expandedRow.proposalEntry?.results) {
      await getProposalVotes(expandedRow.proposalEntry.id);
    }
  });

  $: votes = { ...expandedRow.proposalEntry.results };
</script>

<BorderContainer>
  <div class="py-2 px-4 bg-grey10 rounded">
    <p class="mb-3">
      {@html expandedRow.proposalEntry?.body}
    </p>
    <p>
      <a href="https://etherscan.io/block/{expandedRow.proposalEntry.snapshot}" target="_blank">
        Snapshot Block
      </a>
    </p>
    <p>
      <a href="https://cloudflare-ipfs.com/ipfs/{expandedRow.proposalEntry.id}" target="_blank">IPFS Link</a>
    </p>
    {#if votes.total}
      <ul class="mb-3">
        <li>Choices:</li>
        {#each expandedRow.proposalEntry.choices as choice, index}
          <li>
            {choice}
            {votes?.[index]}
            (~{((100 / votes?.total) * votes?.[index]).toFixed(2)}%)
          </li>
        {/each}
        <li>Total votes: {votes?.total}</li>
      </ul>
    {:else}
      <p>loading votes</p>
    {/if}
    <p>Your vote: {value}</p>
    <select bind:value>
      <option value="null" selected disabled>Select your choice</option>
      {#each expandedRow.proposalEntry.choices as choice, index}
        <option value="{index}">{choice}</option>
      {/each}
    </select>
    <button on:click="{initializeVote}">Send vote</button>
  </div>
</BorderContainer>
<div class="flex justify-between mb-6">
  <a href="https://snapshot.org/#/alchemixstakers.eth/proposal/{expandedRow.proposalEntry.id}" target="_blank"
    >View proposal on Snapshot</a
  >
</div>
