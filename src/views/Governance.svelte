<script>
import { onMount } from 'svelte';
import { _ } from 'svelte-i18n';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import { getOpenProposals } from '../middleware/snapshot';
import governance from '../stores/governance';
import settings from '../stores/settings';
import Button from '../components/elements/Button.svelte';
import DetailView from '../components/composed/Table/governance/DetailView.svelte';
import { BarLoader } from 'svelte-loading-spinners';
import Table from '../components/composed/Table/Table.svelte';
import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
import ExpandHeaderCell from '../components/composed/Table/ExpandHeaderCell.svelte';
import ExpandRowCell from '../components/composed/Table/ExpandRowCell.svelte';

const openAllOnSnapshot = () => {
  window.open('https://snapshot.org/#/alchemixstakers.eth', '_blank');
};

/*
 * @dev transforms snapshot's block notation to human readable date
 * @param snapshotBlock the block number
 * */
const snapshotToDate = (snapshotBlock) => {
  return new Date(snapshotBlock * 1e3).toLocaleDateString($settings.userLanguage.locale);
};

// set up columns for table
const columns = [
  {
    columnId: 'col0',
    CellComponent: ExpandHeaderCell,
  },
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Title',
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Status',
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'Start',
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'End',
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'Snapshot',
  },
  {
    columnId: 'col6',
    CellComponent: HeaderCell,
    value: 'IPFS',
  },
];

// initialize rows, fill with data later
let rows = [];

$: if ($governance.proposals.length > 0) {
  $governance.proposals.forEach((proposal) => {
    const payload = {
      col0: {
        CellComponent: ExpandRowCell,
        expandedRow: {
          ExpandedRowComponent: DetailView,
          proposalEntry: proposal,
        },
      },
      col1: {
        value: proposal.title,
      },
      col2: {
        value: proposal.state,
      },
      col3: {
        value: snapshotToDate(proposal.start),
      },
      col4: {
        value: snapshotToDate(proposal.end),
      },
      col5: {
        value: proposal.snapshot,
      },
      col6: {
        value: proposal.id,
      },
    };
    rows.push(payload);
  });
}

onMount(() => {
  if ($governance.proposals.length === 0) {
    getOpenProposals();
  }
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
    <p class="text-center">{$_('governance_page.loading')}</p>
    <div class="flex justify-center">
      <BarLoader color="#F5C59F" />
    </div>
  {:else if $governance.proposals.length > 0}
    <p class="text-center text-xs mb-6 opacity-50">
      {$_('governance_page.noTranslation')}
    </p>
    <Table rows="{rows}" columns="{columns}" />
  {:else}
    <p class="text-center opacity-50">
      {$_('governance_page.noOpenVotes')}
    </p>
  {/if}
</ViewContainer>
