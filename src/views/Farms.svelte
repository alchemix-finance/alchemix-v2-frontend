<script>
import { ethers, BigNumber } from 'ethers';
import { onMount } from 'svelte';
import { _ } from 'svelte-i18n';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import PageHeader from '../components/elements/PageHeader.svelte';
import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
import Button from '../components/elements/Button.svelte';
import Table from '../components/composed/Table/Table.svelte';
import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
import ExpandRowCell from '../components/composed/Table/ExpandRowCell.svelte';
import FarmNameCell from '../components/composed/Table/farms/FarmNameCell.svelte';
import RewardCell from '../components/composed/Table/farms/RewardCell.svelte';
import ActionsCell from '../components/composed/Table/farms/ActionsCell.svelte';
import ExternalFarms from '../components/composed/Table/farms/ExternalFarms.svelte';
import ExitCell from '../components/composed/Table/farms/ExitCell.svelte';
import ExpandedFarm from '../components/composed/Table/farms/ExpandedFarm.svelte';
import getContract from '../helpers/getContract';
import { poolLookup } from '../stores/stakingPools';
import stakingPools from '../stores/stakingPools';
import { BarLoader } from 'svelte-loading-spinners';
import account from '../stores/account';
import walletBalance from '../stores/walletBalance';

const colsActive = [
  {
    columnId: 'col0',
    value: '',
    colSize: 1,
  },
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Pool',
    colSize: '3',
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'TVL',
    colSize: 2,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'Rewards',
    colSize: 3,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'APR',
    colSize: 1,
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'Action',
    colSize: 3,
  },
];
let rowsActive = [];

const colsRetired = [
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Pool',
    colSize: 7,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Staked Token',
    colSize: 4,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'Claimable Rewards',
    colSize: 4,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'Action',
    colSize: 5,
  },
];
let rowsRetired = [];

// this is for internal pools only
// double reward pools like sushi or 3crv are external
// those need a different approach to handling data
const pools = getContract('StakingPools');
const format = ethers.utils.formatUnits;

const goTo = (url) => {
  window.open(url, '_blank');
};

const toggleButtons = {
  farmSelect: {
    active: true,
    retired: false,
    external: false,
  },
};

const buttonToggler = (selector, key) => {
  Object.keys(toggleButtons[selector]).forEach((entry) => {
    if (toggleButtons[selector][entry] !== key) {
      toggleButtons[selector][entry] = false;
    }
  });
  toggleButtons[selector][key] = true;
};

// @dev logic for controlling the filtered views
const vaultFilter = (filter) => {
  const selector = ['farmSelect', 'modeSelect', 'stratSelect'];
  buttonToggler(selector[filter.id], filter.filter);
};

onMount(async () => {
  if ($stakingPools.fetching) {
    const poolCount = BigNumber.from(await pools.poolCount()).toString();

    for (let i = 0; i < poolCount; i++) {
      const checkToken = await pools.getPoolToken(i);
      const token = checkToken.toLowerCase();
      const checkReward = await pools.getPoolRewardRate(i);
      const checkTotalReward = await pools.rewardRate();
      const reward = format(checkReward.toString(), 'ether');
      // const totalReward = format(checkTotalReward.toString(), 'ether');
      const checkUserDeposit = await pools.getStakeTotalDeposited($account.address, i);
      const userDeposit = format(checkUserDeposit.toString(), 'ether');
      const checkUserUnclaimed = await pools.getStakeTotalUnclaimed($account.address, i);
      const userUnclaimed = format(checkUserUnclaimed.toString(), 'ether');
      const checkTvl = await pools.getPoolTotalDeposited(i);
      const tvl = format(checkTvl.toString(), 18);
      const poolConfig = poolLookup.find((pool) => pool.address === token);
      const rewardToken = 'ALCX';

      if (poolConfig && reward !== '0.0') {
        const userToken = $walletBalance.tokens.find((userToken) => userToken.address === token);

        const expandedProps = {
          poolId: i,
          token: userToken,
          stakedBalance: userDeposit,
          unclaimedRewards: userUnclaimed,
          reward: rewardToken,
        };

        const payload = {
          col0: {
            CellComponent: ExpandRowCell,
            expandedRow: {
              ExpandedRowComponent: ExpandedFarm,
            },
            ...expandedProps,
            colSize: 1,
          },
          col1: {
            CellComponent: FarmNameCell,
            farmName: poolConfig.title,
            farmSubtitle: poolConfig.subtitle,
            farmIcon: poolConfig.farmIcon,
            tokenIcon: poolConfig.tokenIcon,
            colSize: 3,
            alignment: 'justify-self-start',
          },
          col2: {
            value: tvl,
            colSize: 2,
          },
          col3: {
            CellComponent: RewardCell,
            rewards: [
              {
                iconName: 'alchemix',
                tokenName: 'ALCX',
              },
            ],
            colSize: 3,
          },
          col4: {
            value: 'N/A',
            colSize: 1,
          },
          col5: {
            CellComponent: ActionsCell,
            label: 'Manage',
            expandedRow: {
              ExpandedRowComponent: ExpandedFarm,
            },
            ...expandedProps,
            poolId: i,
            colSize: 3,
          },
        };
        $stakingPools.active.push(payload);
      } else if (poolConfig && reward === '0.0') {
        const payload = {
          col1: {
            CellComponent: FarmNameCell,
            tokenIcon: poolConfig.tokenIcon,
            farmIcon: poolConfig.farmIcon,
            farmName: poolConfig.title,
            farmSubtitle: poolConfig.subtitle,
            colSize: 7,
          },
          col2: {
            value: userDeposit,
            colSize: 4,
          },
          col3: {
            value: userUnclaimed,
            colSize: 4,
          },
          col4: {
            CellComponent: ExitCell,
            poolId: i,
            colSize: 5,
          },
        };
        $stakingPools.retired.push(payload);
      }
    }
    $stakingPools.fetching = false;
  }
});

$: if ($stakingPools.active.length > 0) {
  $stakingPools.active.forEach((pool) => {
    rowsActive.push(pool);
  });
}

$: if ($stakingPools.retired.length > 0) {
  $stakingPools.retired.forEach((pool) => {
    rowsRetired.push(pool);
  });
}
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="farm_thin.svg"
      pageTitle="{$_('farm_page.title')}"
      pageSubtitle="{$_('farm_page.subtitle')}"
    />
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 flex space-x-4">
        <Button
          label="Active"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.farmSelect.active}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'active' })}"
        />

        <Button
          label="Retired"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.farmSelect.retired}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'retired' })}"
        />

        <Button
          label="External"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.farmSelect.external}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'external' })}"
        />
      </div>
      <div slot="body">
        {#if $stakingPools.fetching}
          <div class="flex justify-center my-4">
            <BarLoader color="#F5C59F" />
          </div>
        {:else if toggleButtons.farmSelect.active}
          <Table columns="{colsActive}" rows="{rowsActive}" />
        {:else if toggleButtons.farmSelect.retired}
          <Table columns="{colsRetired}" rows="{rowsRetired}" />
        {:else if toggleButtons.farmSelect.external}
          <ExternalFarms />
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
