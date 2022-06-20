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
  import { TransmuterNameAliases, VaultTypesInfos, chainIds } from '@stores/v2/constants';
  import {
    addressStore,
    balancesStore,
    transmutersStore,
    networkStore,
    tokenPriceStore,
  } from '@stores/v2/alcxStore';
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

        // const tokenPrice = $global.tokenPrices.find(
        //   (token) => token.address.toLowerCase() === synthTokenData.address.toLowerCase(),
        // )?.price;
        const tokenPrice =
          $tokenPriceStore[underlyingTokenData.address.toLowerCase()][
            $settings.baseCurrency.symbol.toLowerCase()
          ];

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
              balance: totalDeposited,
              symbol: synthTokenData?.symbol || '',
              perShare: 1,
              decimals: 18,
              address: underlyingTokenData?.address,
            },
            colSize: 2,
          },
          col4: {
            CellComponent: CurrencyCell,
            value: withdrawValue,
            token: {
              balance: _transmuterData.unexchangedBalanceBN,
              symbol: synthTokenData?.symbol || '',
              perShare: 1,
              decimals: 18,
              address: underlyingTokenData?.address,
            },
            colSize: 2,
          },
          col6: {
            CellComponent: CurrencyCell,
            value: claimValue,
            token: {
              balance: _transmuterData.exchangedBalanceBN,
              symbol: underlyingTokenData?.symbol || '',
              perShare: 1,
              decimals: underlyingTokenData?.decimals || 18,
              address: underlyingTokenData?.address,
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

    let transmuterSelection = [];
    const transmuterFilter = chainIds.filter((entry) => entry.id === $networkStore)[0];
    transmuterFilter.vaultTypes.forEach((type) => {
      transmuterSelection.push(fetchTransmutersForVaultType(type, [signer, addressStore], $networkStore));
    });

    Promise.all([...transmuterSelection]).then(() => {
      transmutersLoading = false;
    });
  };

  $: onInitialize($addressStore, $balancesStore, $signer);
  $: allowedVaultTypes = chainIds.filter((entry) => entry.id === $networkStore)[0].vaultTypes;
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="transmuter_thin.svg"
      pageTitle="{$_('transmuter_page.title')}"
      pageSubtitle="{$_('transmuter_page.subtitle')}"
    />
  </div>

  <div slot="message">
    <div class="flex flex-row space-x-4">
      <p class="self-center">{$_('transmuter_page.disclaimer')}</p>
      <Button
        label="Discussion"
        width="w-max"
        on:clicked="{() => {
          window.open(
            'https://forum.alchemix.fi/public/d/291-aip-39-alusd-v1-transmuter-migration-to-amo-and-boosted-yield',
            '_blank',
          );
        }}"
      />
      <Button
        label="Snapshot"
        width="w-max"
        on:clicked="{() => {
          window.open(
            'https://snapshot.org/#/alchemixstakers.eth/proposal/0x30585c0ef576da3aa3d9c9980823d96a8a6eaa90592f6754ef91b40eb7583f26',
            '_blank',
          );
        }}"
      />
    </div>
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
            allowedVaultTypes,
          )}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => currentTransmuterCategories.select(allowedVaultTypes)}"
        >
          <p slot="leftSlot">
            <img src="images/icons/alcx_med.svg" alt="all vaultAlUsd" class="w-5 h-5" />
          </p>
        </Button>
        {#if allowedVaultTypes.length > 1}
          {#each allowedVaultTypes as transmuterType}
            <Button
              label="{VaultTypesInfos[transmuterType].name}"
              width="w-max"
              canToggle="{true}"
              selected="{currentTransmuterCategories.isSelected(
                $currentTransmuterCategories,
                transmuterType,
              )}"
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
        {/if}
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
            <p>Didn't find any transmuters for this type of asset.</p>
          </div>
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
