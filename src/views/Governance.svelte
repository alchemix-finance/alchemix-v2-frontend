<script>
import { onMount } from 'svelte';
import { _ } from 'svelte-i18n';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import PageHeader from '../components/elements/PageHeader.svelte';
import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
import { getOpenProposals, getVotesForAddress } from '../middleware/snapshot';
import governance from '../stores/governance';
import settings from '../stores/settings';
import Button from '../components/elements/Button.svelte';
import DetailView from '../components/composed/Table/governance/DetailView.svelte';
import { BarLoader } from 'svelte-loading-spinners';
import Table from '../components/composed/Table/Table.svelte';
import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
import ExpandRowCell from '../components/composed/Table/ExpandRowCell.svelte';
import IpfsCell from '../components/composed/Table/governance/IpfsCell.svelte';
import SnapshotCell from '../components/composed/Table/governance/SnapshotCell.svelte';

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
    value: '',
    colSize: 1,
  },
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Title',
    colSize: 8,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Status',
    colSize: 2,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'Start',
    colSize: 2,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'End',
    colSize: 2,
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'Snapshot',
    colSize: 3,
  },
  {
    columnId: 'col6',
    CellComponent: HeaderCell,
    value: 'IPFS',
    colSize: 3,
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
        colSize: 1,
      },
      col1: {
        value: proposal.title,
        colSize: 8,
        alignment: 'justify-self-start',
      },
      col2: {
        value: proposal.state,
        colSize: 2,
      },
      col3: {
        value: snapshotToDate(proposal.start),
        colSize: 2,
      },
      col4: {
        value: snapshotToDate(proposal.end),
        colSize: 2,
      },
      col5: {
        snapshot: proposal.snapshot,
        colSize: 3,
        CellComponent: SnapshotCell,
      },
      col6: {
        ipfsShort: proposal.ipfs.slice(0, 8),
        ipfsId: proposal.ipfs,
        colSize: 3,
        CellComponent: IpfsCell,
      },
    };
    rows.push(payload);
  });
}

onMount(() => {
  if ($governance.proposals.length === 0) {
    getOpenProposals();
    getVotesForAddress();
  }
});
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="alcx_thin.svg"
      pageTitle="{$_('governance_page.title')}"
      pageSubtitle="{$_('governance_page.subtitle')}"
    />
  </div>
  <div class="w-full">
    <p class="text-center text-xs mb-6 opacity-50">
      {$_('governance_page.noTranslation')}
    </p>
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex justify-between">
        <p class="inline-block self-center">Proposals</p>

        <Button
          label="{$_('governance_page.openAllOnSnapshot')}"
          borderSize="1"
          height="h-8"
          width="w-max"
          fontSize="text-md"
          on:clicked="{() => openAllOnSnapshot()}"
        />
      </div>

      <div slot="body">
        {#if $governance.fetching}
          <!--          <p class="text-center mt-4">{$_('governance_page.loading')}</p>-->
          <div class="flex justify-center my-4">
            <BarLoader color="#F5C59F" />
          </div>
        {:else if $governance.proposals.length > 0}
          <Table rows="{rows}" columns="{columns}" />
        {:else}
          <p class="text-center opacity-50">
            {$_('governance_page.noOpenVotes')}
          </p>
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
