<script>
  import { utils } from 'ethers';
  import { _ } from 'svelte-i18n';
  import { BarLoader } from 'svelte-loading-spinners';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import PageHeader from '../components/elements/PageHeader.svelte';
  import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
  import Button from '../components/elements/Button.svelte';
  import { makeSelectorStore } from '@stores/v2/selectorStore';
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
  import settings from '@stores/settings';
  import TransmuterEntry from '@components/composed/TransmuterEntry.svelte';

  const currentTransmuterCategories = makeSelectorStore([VaultTypes.alUSD, VaultTypes.alETH]);

  let transmutersLoading = true;

  function calculateBalanceValue(_tokenAmount, _price) {
    return parseFloat(utils.formatEther(_tokenAmount)) * _price;
  }

  $: currentRowsForSelectedType = Object.keys($transmutersStore)
    .map(
      (vaultId) =>
        $currentTransmuterCategories.includes(parseInt(vaultId)) &&
        $transmutersStore[parseInt(vaultId)].transmuters,
    )
    .filter((elm) => elm !== undefined)
    .reduce((acc, value) => acc.concat(value), [])
    .map((_transmuterData) => {
      if (_transmuterData) {
        const synthTokenData = getTokenDataFromBalances(_transmuterData.synthAddress, [$balancesStore]);
        const underlyingTokenData = getTokenDataFromBalances(_transmuterData.underlyingTokenAddress, [
          $balancesStore,
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
            transmuterData: _transmuterData,
            colSize: 1,
          },
          col2: {
            farmIcon: (synthTokenData?.symbol.toLowerCase() || '') + '_med.svg',
            tokenIcon: underlyingTokenData?.symbol.toLowerCase() || '',
            farmName: nameAlias,
            farmSubtitle: (synthTokenData?.symbol || '') + '-' + (underlyingTokenData?.symbol || ''),
            alignment: 'justify-self-start',
          },
          col3: {
            value: depositValue,
            token: {
              balance: totalDeposited,
              symbol: synthTokenData?.symbol || '',
              perShare: 1,
              decimals: 18,
              address: underlyingTokenData?.address,
            },
          },
          col4: {
            value: withdrawValue,
            token: {
              balance: _transmuterData.unexchangedBalanceBN,
              symbol: synthTokenData?.symbol || '',
              perShare: 1,
              decimals: 18,
              address: underlyingTokenData?.address,
            },
          },
          col6: {
            value: claimValue,
            token: {
              balance: _transmuterData.exchangedBalanceBN,
              symbol: underlyingTokenData?.symbol || '',
              perShare: 1,
              decimals: underlyingTokenData?.decimals || 18,
              address: underlyingTokenData?.address,
            },
          },
        };
      }
    })
    .filter((elm) => elm !== undefined);

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

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex flex-col lg:flex-row gap-1">
        <Button
          label="{$_('transmuter_page.all_transmuter')}"
          class="w-full lg:w-max"
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
            <img src="./images/icons/alcx_med.svg" alt="all vaultAlUsd" class="w-5 h-5" />
          </p>
        </Button>
        {#if allowedVaultTypes.length > 1}
          {#each allowedVaultTypes as transmuterType}
            <Button
              label="{VaultTypesInfos[transmuterType].name}"
              class="w-full lg:w-max"
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
                  class=" w-5 h-5"
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
          <div class="flex flex-col space-y-4 py-4">
            {#each currentRowsForSelectedType as transmuter}
              <TransmuterEntry transmuter="{transmuter}" />
            {/each}
          </div>
        {:else}
          <div class="flex justify-center my-4">
            <p>Didn't find any transmuters for this type of asset.</p>
          </div>
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
