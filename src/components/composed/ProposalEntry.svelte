<script lang="ts">
  import settings from '@stores/settings';
  import governance from '@stores/governance';

  import Button from '@components/elements/Button.svelte';
  import IpfsCell from '@components/composed/Table/governance/IpfsCell.svelte';
  import SnapshotCell from '@components/composed/Table/governance/SnapshotCell.svelte';
  import GenericCell from '@components/composed/Table/governance/GenericCell.svelte';
  import StatusCell from '@components/composed/Table/governance/StatusCell.svelte';
  import DetailView from '@components/composed/Table/governance/DetailView.svelte';

  export let proposal;

  enum VotingType {
    'single-choice' = 'Single Choice',
    'approval' = 'Approval Voting',
    'quadratic' = 'Quadratic Voting',
    'ranked-choice' = 'Ranked Choice',
    'weighted' = 'Weighted Voting',
    'basic' = 'Basic Voting',
  }

  let isExpanded = false;
  let isHovered = false;

  $: vote = $governance.userVotes?.find((_vote) => _vote.proposal.id === proposal.id);

  const toggleExpanded = () => {
    isExpanded = !isExpanded;
  };

  /*
   * @dev transforms snapshot's block notation to human-readable date
   * @param snapshotBlock the block number
   * */
  const snapshotToDate = (snapshotBlock) => {
    return new Date(snapshotBlock * 1e3).toLocaleDateString($settings.userLanguage.locale);
  };
</script>

<div class="flex flex-row relative items-center px-4">
  <div
    class="flex flex-col border rounded w-full relative {$settings.invertColors
      ? 'bg-grey10inverse border-grey3inverse'
      : 'bg-grey10 border-grey3'}"
    on:mouseenter="{() => {
      isHovered = true;
    }}"
    on:mouseleave="{() => {
      isHovered = false;
    }}"
  >
    <div class="absolute -left-2 top-4">
      <div class="flex justify-center items-center w-6">
        <Button
          borderColor="bronze3"
          selected="{isHovered}"
          fontSize="text-md"
          py="py-0"
          label="{isExpanded ? '-' : '+'}"
          on:clicked="{() => toggleExpanded()}"
        />
      </div>
    </div>
    <div
      on:click="{() => toggleExpanded()}"
      class="w-full px-8 py-4 flex flex-col space-y-4 hover:cursor-pointer"
    >
      <div class="w-full flex flex-row space-x-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="{vote ? '#42B792' : '#979BA2'}"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          ></path>
        </svg>
        <GenericCell value="{proposal.title}" state="{proposal.state}" />
      </div>
      <div class="w-full grid grid-cols-6">
        <div class="flex flex-col items-center">
          <p class="text-center text-sm text-lightgrey10">Status</p>
          <StatusCell value="{proposal.state}" state="{proposal.state}" />
        </div>
        <div class="flex flex-col items-center">
          <p class="text-center text-sm text-lightgrey10">Type</p>
          <GenericCell value="{VotingType[proposal.type]}" state="{proposal.state}" />
        </div>
        <div class="flex flex-col items-center">
          <p class="text-center text-sm text-lightgrey10">Start</p>
          <GenericCell value="{snapshotToDate(proposal.start)}" state="{proposal.state}" />
        </div>
        <div class="flex flex-col items-center">
          <p class="text-center text-sm text-lightgrey10">End</p>
          <GenericCell value="{snapshotToDate(proposal.end)}" state="{proposal.state}" />
        </div>
        <div class="flex flex-col items-center">
          <p class="text-center text-sm text-lightgrey10">Snapshot</p>
          <SnapshotCell snapshot="{proposal.snapshot}" state="{proposal.state}" />
        </div>
        <div class="flex flex-col items-center">
          <p class="text-center text-sm text-lightgrey10">IPFS</p>
          <IpfsCell
            ipfsShort="{proposal.ipfs.slice(0, 8)}"
            ipfsId="{proposal.ipfs}"
            state="{proposal.state}"
          />
        </div>
      </div>
    </div>
    {#if isExpanded}
      <div class="w-full flex flex-col">
        <DetailView proposalEntry="{proposal}" proposal="{proposal}" vote="{vote}" />
      </div>
    {/if}
  </div>
</div>
