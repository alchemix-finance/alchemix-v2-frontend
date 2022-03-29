<script>
  import { utils, BigNumber } from 'ethers';
  import { _ } from 'svelte-i18n';
  import { BarLoader } from 'svelte-loading-spinners';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import PageHeader from '../components/elements/PageHeader.svelte';
  import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
  import Button from '../components/elements/Button.svelte';
  import Table from '../components/composed/Table/Table.svelte';
  import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
  import ExpandRowCell from '../components/composed/Table/ExpandRowCell.svelte';
  import ExpandedTransmuter from '../components/composed/Table/transmuter/ExpandedTransmuter.svelte';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import CurrencyCell from '@components/composed/Table/CurrencyCell.svelte';
  import makeSelectorStore from '@stores/v2/selectorStore';
  import { VaultTypes } from '@stores/v2/types';
  import { AllowedTransmuterTypes, TransmuterNameAliases, VaultTypesInfos } from '@stores/v2/constants';
  import { addressStore, balancesStore, transmutersStore } from '@stores/v2/alcxStore';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { fetchTransmutersForVaultType } from '@stores/v2/asyncMethods';
  import { signer } from '@stores/v2/derived';
  import global from '@stores/global';
  import settings from '@stores/settings';

  const currentTransmuterCategories = makeSelectorStore([VaultTypes.alUSD, VaultTypes.alETH]);

  let transmutersLoading = true;

  const columns = [
    {
      columnId: 'col1',
      CellComponent: HeaderCell,
      value: '',
      colSize: 1,
    },
    {
      columnId: 'col2',
      CellComponent: HeaderCell,
      value: $_('transmuter_page.title'),
      colSize: 2,
    },
    {
      columnId: 'col3',
      CellComponent: HeaderCell,
      value: $_('table.deposited'),
      colSize: 2,
    },
    {
      columnId: 'col4',
      CellComponent: HeaderCell,
      value: $_('table.withdrawable'),
      colSize: 2,
    },
    {
      columnId: 'col6',
      CellComponent: HeaderCell,
      value: $_('table.claimable'),
      colSize: 2,
    },
    // {
    //   columnId: 'col5',
    //   CellComponent: HeaderCell,
    //   //Don't like this but better than APY for now.
    //   //I think this needs a tool tip
    //   value: $_('table.maturation_rate'),
    //   colSize: 2,
    // },
  ];

  const goTo = (url) => {
    window.open(url, '_blank');
  };

  function calculateBalanceValue(_tokenAmount, _price) {
    return parseFloat(utils.formatEther(_tokenAmount)) * _price;
  }

  const renderTransmuters = (transmutersStore, currentTransmuterType, balancesStore) => {
    if (!transmutersStore || !balancesStore) {
      return [];
    }

    return Object.keys(transmutersStore)
      .map(
        (vaultId) =>
          currentTransmuterType.includes(parseInt(vaultId)) &&
          transmutersStore[parseInt(vaultId)].transmuters,
      )
      .filter((elm) => elm !== undefined)
      .reduce((acc, value) => acc.concat(value), [])
      .map((_transmuterData) => {
        if (!_transmuterData) {
          return {};
        }

        const synthTokenData = getTokenDataFromBalances(_transmuterData.synthAddress, [balancesStore]);
        const underlyingTokenData = getTokenDataFromBalances(_transmuterData.underlyingTokenAddress, [
          balancesStore,
        ]);

        const tokenPrice = $global.tokenPrices.find(
          (token) => token.address.toLowerCase() === synthTokenData.address.toLowerCase(),
        )?.price;

        const nameAlias = TransmuterNameAliases[`${underlyingTokenData?.symbol}`.toLowerCase()] || '';

        const totalDeposited = _transmuterData.exchangedBalanceBN.add(_transmuterData.unexchangedBalanceBN);
        const depositValue = calculateBalanceValue(totalDeposited, tokenPrice);
        const withdrawValue = calculateBalanceValue(_transmuterData.unexchangedBalanceBN, tokenPrice);
        const claimValue = calculateBalanceValue(_transmuterData.exchangedBalanceBN, tokenPrice);

        return {
          col1: {
            CellComponent: ExpandRowCell,
            expandedRow: {
              ExpandedRowComponent: ExpandedTransmuter,
            },
            transmuterData: _transmuterData,
            colSize: 1,
          },
          col2: {
            CellComponent: FarmNameCell,
            farmIcon: (synthTokenData?.symbol.toLowerCase() || '') + '_med.svg',
            tokenIcon: underlyingTokenData?.symbol.toLowerCase() || '',
            farmName: nameAlias,
            farmSubtitle: (synthTokenData?.symbol || '') + '-' + (underlyingTokenData?.symbol || ''),
            colSize: 2,
            alignment: 'justify-self-start',
          },
          col3: {
            CellComponent: CurrencyCell,
            value: depositValue,
            token: {
              balance: totalDeposited.mul(BigNumber.from(10).pow(18)),
              symbol: synthTokenData?.symbol || '',
              perShare: 1,
              decimals: 18,
            },
            colSize: 2,
          },
          col4: {
            CellComponent: CurrencyCell,
            value: withdrawValue,
            token: {
              balance: _transmuterData.unexchangedBalanceBN.mul(BigNumber.from(10).pow(18)),
              symbol: synthTokenData?.symbol || '',
              perShare: 1,
              decimals: 18,
            },
            colSize: 2,
          },
          col6: {
            CellComponent: CurrencyCell,
            value: claimValue,
            token: {
              balance: _transmuterData.exchangedBalanceBN.mul(
                BigNumber.from(10).pow(underlyingTokenData?.decimals),
              ),
              symbol: underlyingTokenData?.symbol || '',
              perShare: 1,
              decimals: underlyingTokenData?.decimals || 18,
            },
            colSize: 2,
          },
          // col5: {
          //   value: '455%',
          //   colSize: 2,
          // },
        };
      });
  };

  $: currentRowsForSelectedType = !transmutersLoading
    ? renderTransmuters($transmutersStore, $currentTransmuterCategories, $balancesStore)
    : [];

  const onInitialize = async (addressStore, balancesStore, signer) => {
    if (!addressStore || !balancesStore || !signer) {
      transmutersLoading = true;
      return;
    }

    Promise.all([
      fetchTransmutersForVaultType(VaultTypes.alUSD, [signer, addressStore]),
      fetchTransmutersForVaultType(VaultTypes.alETH, [signer, addressStore]),
    ]).then(() => {
      transmutersLoading = false;
    });
  };

  $: onInitialize($addressStore, $balancesStore, $signer);
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="transmuter_thin.svg"
      pageTitle="{$_('transmuter_page.title')}"
      pageSubtitle="{$_('transmuter_page.subtitle')}"
    />
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex justify-between">
        <p class="inline-block self-center">{$_('transmuter_page.external_swaps')}</p>
      </div>
      <div slot="body" class="py-4 px-6 flex space-x-4">
        <Button on:clicked="{() => goTo('http://curve.fi')}" label="Curve" width="w-max" py="py-2">
          <img src="images/icons/crv.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
        <Button on:clicked="{() => goTo('http://zapper.fi')}" label="Zapper" width="w-max" py="py-2">
          <img src="images/icons/zapper.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
        <Button on:clicked="{() => goTo('http://paraswap.io')}" label="Paraswap" width="w-max" py="py-2">
          <img src="images/icons/paraswap.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
      </div>
    </ContainerWithHeader>
  </div>
  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex gap-1">
        <Button
          label="{$_('transmuter_page.all_transmuter')}"
          width="w-max"
          canToggle="{true}"
          selected="{currentTransmuterCategories.isSelectedAll(
            $currentTransmuterCategories,
            AllowedTransmuterTypes,
          )}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => currentTransmuterCategories.select(AllowedTransmuterTypes)}"
        >
          <p slot="leftSlot">
            <img src="images/icons/alcx_med.svg" alt="all vaultAlUsd" class="w-5 h-5" />
          </p>
        </Button>
        {#each AllowedTransmuterTypes as transmuterType}
          <Button
            label="{VaultTypesInfos[transmuterType].name}"
            width="w-max"
            canToggle="{true}"
            selected="{currentTransmuterCategories.isSelected($currentTransmuterCategories, transmuterType)}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => currentTransmuterCategories.select([transmuterType])}"
          >
            <p slot="leftSlot">
              <img
                src="{VaultTypesInfos[transmuterType].icon}"
                alt="{VaultTypesInfos[transmuterType].name} transmuters"
                class="w-5 h-5"
              />
            </p>
          </Button>
        {/each}
      </div>
      <div slot="body">
        {#if transmutersLoading}
          <div class="flex justify-center my-4">
            <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
          </div>
        {:else if currentRowsForSelectedType.length > 0}
          <Table rows="{currentRowsForSelectedType}" columns="{columns}" />
        {:else}
          <div class="flex justify-center my-4">
            <p>Didn't found any transmuters for this type of asset.</p>
          </div>
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
