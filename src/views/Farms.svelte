<script>
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
  import stakingPools from '../stores/stakingPools';
  import { BarLoader } from 'svelte-loading-spinners';
  import account from '@stores/account';
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

  let loading = true;
  const renderFarms = async () => {
    if (loading) {
      $stakingPools.allPools.forEach((pool) => {
        const userToken = $walletBalance.tokens.find((item) => item.address === pool.token);
        if (pool.poolConfig && pool.reward !== '0.0') {
          const expandedProps = {
            poolId: pool.poolId,
            token: userToken,
            stakedBalance: pool.userDeposit,
            unclaimedRewards: pool.userUnclaimed,
            reward: pool.rewardToken,
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
              farmName: pool.poolConfig.title,
              farmSubtitle: pool.poolConfig.subtitle,
              farmIcon: pool.poolConfig.farmIcon,
              tokenIcon: pool.poolConfig.tokenIcon,
              colSize: 3,
              alignment: 'justify-self-start',
            },
            col2: {
              // TODO calculate fiat values
              value: pool.tvl,
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
              colSize: 3,
            },
          };
          rowsActive.push(payload);
        } else if (pool.poolConfig && pool.reward === '0.0') {
          const payload = {
            col1: {
              CellComponent: FarmNameCell,
              tokenIcon: pool.poolConfig.tokenIcon,
              farmIcon: pool.poolConfig.farmIcon,
              farmName: pool.poolConfig.title,
              farmSubtitle: pool.poolConfig.subtitle,
              colSize: 7,
            },
            col2: {
              value: pool.userDeposit,
              colSize: 4,
            },
            col3: {
              value: pool.userUnclaimed,
              colSize: 4,
            },
            col4: {
              CellComponent: ExitCell,
              poolId: pool.poolId,
              colSize: 5,
            },
          };
          rowsRetired.push(payload);
        }
        if (pool.poolId + 1 === parseInt($stakingPools.pools, 10)) {
          loading = false;
        }
      });
    }
  };

  $: if (!$account.loadingFarmsConfigurations && !$account.loadingWalletBalance) renderFarms();

  onMount(() => {});
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
        {#if loading}
          <p class="inline-block self-center">{$_('fetching_data')}</p>
        {:else}
          <Button
            label="Active"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.farmSelect.active}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 0, filter: 'active' })}"
          />

          {#if rowsRetired.length > 0}
            <Button
              label="Retired"
              width="w-max"
              canToggle="{true}"
              selected="{toggleButtons.farmSelect.retired}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 0, filter: 'retired' })}"
            />
          {/if}

          <Button
            label="External"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.farmSelect.external}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 0, filter: 'external' })}"
          />
        {/if}
      </div>
      <div slot="body">
        {#if loading}
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
