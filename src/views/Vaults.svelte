<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import { BarLoader } from 'svelte-loading-spinners';

  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import ActionsCell from '@components/composed/Table/vaults/ActionsCell.svelte';
  import CurrencyCell from '@components/composed/Table/CurrencyCell.svelte';
  import Metrics from '@components/composed/Metrics.svelte';
  import YieldCell from '@components/composed/Table/YieldCell.svelte';
  import VaultCapacityCell from '@components/composed/Table/VaultCapacityCell.svelte';
  import VaultStrategy from '@components/composed/VaultStrategy.svelte';
  import AccountOperations from '@components/composed/AccountOperations.svelte';

  import settings from '@stores/settings';
  import { balancesStore, vaultsStore, networkStore, tokenPriceStore } from '@stores/v2/alcxStore';
  import { VaultTypes } from '@stores/v2/types';
  import { VaultTypesInfos, chainIds } from '@stores/v2/constants';
  import { makeSelectorStore } from '@stores/v2/selectorStore';
  import { calculateVaultDebt, getTokenDataFromBalances } from '@stores/v2/helpers';
  import { vaultsLoading } from '@stores/v2/loadingStores';
  import { signer } from '@stores/v2/derived';
  import { setError } from '@helpers/setToast';

  $: vaultTypes = chainIds.filter((entry) => entry.id === $networkStore)[0].vaultTypes;
  $: vaultsSelector = makeSelectorStore([...vaultTypes]);

  const showMetrics = true;

  // @dev logic for controlling the filtered views

  const TypeOfStrategies = Object.freeze({
    USED: 0,
    UNUSED: 1,
    ALL: 2,
  });

  const strategyFilterFunc = {
    [TypeOfStrategies.USED]: (_vault) => _vault.balance.gt(BigNumber.from(0)),
    [TypeOfStrategies.UNUSED]: (_vault) => _vault.balance.lte(BigNumber.from(0)),
    [TypeOfStrategies.ALL]: (_vault) => true,
  };

  let currentStrategy = TypeOfStrategies.ALL;

  function countStrategiesForTypeOfStrategy(streategyFuncFilter, vaults) {
    return vaults.filter(streategyFuncFilter).length ?? 0;
  }

  function calculateBalanceValue(_tokenAmount, _perShare, _decimals, _price) {
    return (
      parseFloat(
        utils.formatUnits(_tokenAmount.mul(_perShare).div(BigNumber.from(10).pow(_decimals)), _decimals),
      ) * _price
    );
  }

  $: currentVaultsBasedOnType =
    Object.keys($vaultsStore)
      .map((vTypeId) => {
        if ($vaultsSelector.includes(parseInt(vTypeId))) {
          return $vaultsStore[parseInt(vTypeId)].vaultBody;
        }
      })
      .filter((elm) => elm !== undefined)
      .reduce((accumulator, value) => accumulator.concat(value), []) ?? [];

  $: aggregated = currentVaultsBasedOnType.map((vault) => {
    const underlyingTokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);
    const yieldTokenData = getTokenDataFromBalances(vault.address, [$balancesStore]);
    // const tokenPrice = $global.tokenPrices.find(
    //   (token) => token.address.toLowerCase() === underlyingTokenData.address.toLowerCase(),
    // )?.price;
    const currency = $settings.baseCurrency.symbol;
    let tokenPrice;
    try {
      tokenPrice = $tokenPriceStore[vault.underlyingAddress.toLowerCase()][currency.toLowerCase()];
    } catch {
      setError('Token price not found');

      tokenPrice = 1;
    }
    const ratio = parseFloat(utils.formatEther($vaultsStore[vault.type]?.ratio));
    const depositValue = calculateBalanceValue(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData
        ? yieldTokenData.decimals > underlyingTokenData.decimals
          ? yieldTokenData.decimals
          : underlyingTokenData.decimals
        : 0,
      tokenPrice,
    );
    const debtLimit = depositValue / ratio;
    const tvlValue = calculateBalanceValue(
      vault.tvl,
      vault.underlyingPerShare,
      underlyingTokenData
        ? yieldTokenData.decimals > underlyingTokenData.decimals
          ? yieldTokenData.decimals
          : underlyingTokenData.decimals
        : 0,
      tokenPrice,
    );
    const vaultDebt = parseFloat(utils.formatEther($vaultsStore[vault.type].debt.debt)) * tokenPrice;
    const vaultMaxDebt = parseFloat(utils.formatEther($vaultsStore[vault.type].maxDebt)) * tokenPrice;
    const rawWithdraw = depositValue - vaultDebt * ratio;
    const vaultWithdraw = rawWithdraw < 0 ? 0 : rawWithdraw;
    return {
      vaultType: vault.type,
      token: vault.debtToken,
      ratio,
      depositValue,
      debtLimit,
      tvlValue,
      vaultDebt: vaultDebt > 0 ? vaultDebt : 0,
      vaultWithdraw,
      vaultMaxDebt,
    };
  });

  $: currentVaultsBasedOnStrategyType =
    currentVaultsBasedOnType.filter(strategyFilterFunc[currentStrategy]) ?? [];

  $: currentRowsOnCurrentStrategyType = currentVaultsBasedOnStrategyType.map((vault, index) => {
    const vaultTokenData = getTokenDataFromBalances(vault.address, [$balancesStore]);
    const debtTokenData = getTokenDataFromBalances(vault.debtToken, [$balancesStore]);
    const underlyingTokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);
    // const tokenPrice = $global.tokenPrices.find(
    //   (token) => token.address.toLowerCase() === underlyingTokenData.address.toLowerCase(),
    // )?.price;
    const currency = $settings.baseCurrency.symbol;
    let tokenPrice;
    try {
      tokenPrice = $tokenPriceStore[vault.underlyingAddress.toLowerCase()][currency.toLowerCase()];
    } catch {
      setError('Token price not found');
      tokenPrice = 1;
    }
    const depositValue = calculateBalanceValue(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData
        ? vaultTokenData.decimals > underlyingTokenData.decimals
          ? vaultTokenData.decimals
          : underlyingTokenData.decimals
        : 0,
      tokenPrice,
    );
    // const debtValue = depositValue / parseFloat(utils.formatEther($vaultsStore[vault.type].ratio));
    const tvlValue = calculateBalanceValue(
      vault.tvl,
      vault.underlyingPerShare,
      underlyingTokenData
        ? vaultTokenData.decimals > underlyingTokenData.decimals
          ? vaultTokenData.decimals
          : underlyingTokenData.decimals
        : 0,
      tokenPrice,
    );

    const vaultDebt = calculateVaultDebt(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      $vaultsStore[vault.type].ratio,
    );

    // const adapterPrice = $adaptersStore[vault.type].adapters.filter(
    //   (adapter) => adapter.yieldToken === vault.address,
    // )[0].price;
    // const vaultCapacity = getDepositRemainder(vault.address, vault.type, adapterPrice, [$signer]);

    const vaultApy = Math.round(vault.apy * 10000) / 100;
    const vaultDebtDisplay = vault.balance
      .mul(BigNumber.from(10).pow(underlyingTokenData.decimals))
      .div($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)));

    const metaConfig = VaultTypesInfos[vault.type].metaConfig;
    const vaultName = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        const yieldToken = metaConfig[vaultTokenData.address].customTokenName
          ? metaConfig[vaultTokenData.address].token
          : vaultTokenData.symbol;
        return metaConfig[vaultTokenData.address].vaultName + ' ' + yieldToken;
      } else {
        return 'Yearn ' + underlyingTokenData.symbol;
      }
    };
    const yieldToken = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        if (metaConfig[vaultTokenData.address].customAddress !== '') {
          return metaConfig[vaultTokenData.address].customAddress;
        } else {
          return vaultTokenData.address;
        }
      } else {
        return vaultTokenData.address;
      }
    };

    const vaultSubtitle = () => {
      let appendix;
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        appendix = metaConfig[vaultTokenData.address].customTokenName
          ? metaConfig[vaultTokenData.address].token
          : vaultTokenData.symbol;
      } else {
        appendix = vaultTokenData.symbol;
      }
      return underlyingTokenData.symbol + ' + ' + appendix;
    };

    const vaultIcon = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].customTokenName
          ? metaConfig[vaultTokenData.address].token
          : vaultTokenData.symbol;
      } else {
        return underlyingTokenData.symbol;
      }
    };

    const betaStatus = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].beta;
      } else {
        return false;
      }
    };

    const rewardType = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].rewardType;
      } else {
        return 'APY';
      }
    };

    const acceptWETH = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].acceptWETH;
      } else {
        return true;
      }
    };

    const sharesBalance = () => {
      return vault.balance
        .mul(vault.underlyingPerShare)
        .div(BigNumber.from(10).pow(underlyingTokenData.decimals));
    };

    const sanitizeDecimals = () => {
      return vaultTokenData.decimals > underlyingTokenData.decimals
        ? vaultTokenData.decimals
        : underlyingTokenData.decimals;
    };

    const incentives = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].bonusType;
      } else {
        return true;
      }
    };

    const zeroConfException = [
      '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
      '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
      '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE',
      '0x7Da96a3891Add058AdA2E826306D812C638D87a7',
      '0x3B27F92C0e212C671EA351827EDF93DB27cc0c65',
      '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
      '0x637eC617c86D24E421328e6CAEa1d92114892439',
      '0xEF0210eB96c7EB36AF8ed1c20306462764935607',
      '0x148c05caf1Bb09B5670f00D511718f733C54bC4c',
    ];

    if (zeroConfException.includes(vaultTokenData.address) || !!metaConfig[vaultTokenData.address]) {
      return {
        type: vault.balance.gt(BigNumber.from(0)) ? 'used' : 'unused',
        row: {
          hasConfig: metaConfig[vaultTokenData.address],
          col2: {
            CellComponent: FarmNameCell,
            farmName: vaultName(),
            farmSubtitle: vaultSubtitle(),
            farmIcon: `${VaultTypes[vault.type].toLowerCase()}_med.svg`,
            tokenIcon: `${vaultIcon()}`.toLowerCase(),
            isBeta: betaStatus(),
            colSize: 3,
            alignment: 'justify-self-start',
          },
          deposited: {
            CellComponent: CurrencyCell,
            value: depositValue,
            token: {
              balance: sharesBalance(),
              perShare: vault.underlyingPerShare,
              decimals: sanitizeDecimals(),
              symbol: underlyingTokenData.symbol,
              address: underlyingTokenData.address,
            },
            colSize: 2,
          },
          col3: {
            CellComponent: CurrencyCell,
            value: tvlValue,
            token: {
              balance: vault.tvl,
              perShare: vault.underlyingPerShare,
              decimals: underlyingTokenData.decimals,
              symbol: underlyingTokenData.symbol,
              address: underlyingTokenData.address,
            },
            colSize: 2,
          },
          limit: {
            CellComponent: VaultCapacityCell,
            vaultType: vault.type,
            signer: $signer,
            yieldTokenAddress: vaultTokenData.address,
            underlyingPerShare: vault.underlyingPerShare,
            yieldPerShare: vault.yieldPerShare,
            decimals: underlyingTokenData.decimals,
            symbol: underlyingTokenData.symbol,
            colSize: 2,
            fullWidth: true,
          },

          col4: {
            CellComponent: YieldCell,
            yieldRate: vaultApy,
            yieldType: rewardType(),
            incentives: incentives(),
            colSize: 2,
          },
          col5: {
            CellComponent: ActionsCell,
            colSize: 3,
            vault: { ...vault, yieldToken: yieldToken(), acceptWETH: acceptWETH() },
            borrowLimit: vaultDebt,
          },
        },
      };
    } else {
      return false;
    }
  });

  $: noVaultsForStrategyText = {
    [TypeOfStrategies.USED]: $_('table.no_strategies'),
    [TypeOfStrategies.UNUSED]: $_('table.all_strategies'),
    [TypeOfStrategies.ALL]: $_('table.no_strategies_avail'),
  };
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="yield_thin.svg"
      pageTitle="{$_('vaults_page.title')}"
      pageSubtitle="{$_('vaults_page.subtitle')}"
    />
  </div>
  {#if $vaultsLoading}
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 flex space-x-4">
        <p class="inline-block self-center">{$_('fetching_data')}</p>
      </div>
      <div slot="body">
        <div class="flex justify-center my-4">
          <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
        </div>
      </div>
    </ContainerWithHeader>
  {:else}
    <div class="sticky pt-4 top-0 z-40 backdrop-filter backdrop-blur filter drop-shadow-xl">
      <div class="w-full mb-8 md:h-10">
        <div class="w-full">
          <ContainerWithHeader>
            <div slot="body">
              <div class=" items-center flex space-x-2 h-10 px-2">
                {#if vaultTypes.length > 1}
                  <Button
                    label="All Vaults"
                    width="w-max"
                    canToggle="{true}"
                    selected="{vaultsSelector.isSelectedAll($vaultsSelector, vaultTypes)}"
                    solid="{false}"
                    borderSize="0"
                    on:clicked="{() => vaultsSelector.select(vaultTypes)}"
                  >
                    <p slot="leftSlot">
                      <img src="./images/icons/alcx_med.svg" alt="all vaults" class="w-5 h-5" />
                    </p>
                  </Button>
                {/if}
                {#each vaultTypes as vaultType}
                  <Button
                    label="{VaultTypesInfos[vaultType].name}"
                    width="w-max"
                    canToggle="{true}"
                    selected="{vaultsSelector.isSelected($vaultsSelector, vaultType)}"
                    solid="{false}"
                    borderSize="0"
                    on:clicked="{() => vaultsSelector.select([vaultType])}"
                  >
                    <p slot="leftSlot">
                      <img
                        src="{VaultTypesInfos[vaultType].icon}"
                        alt="{VaultTypesInfos[vaultType].name} vaults"
                        class="w-5 h-5"
                      />
                    </p>
                  </Button>
                {/each}
              </div>
            </div>
          </ContainerWithHeader>
        </div>
      </div>

      <div class="w-full space-y-4">
        {#if showMetrics && aggregated.length > 0}
          <Metrics aggregate="{aggregated}" />
          <AccountOperations
            aggregate="{aggregated}"
            availableVaults="{vaultTypes}"
            vaults="{currentVaultsBasedOnStrategyType}"
          />
        {/if}
      </div>
    </div>

    <div class="w-full my-8">
      <ContainerWithHeader>
        <div slot="header" class="py-4 px-6 flex space-x-4">
          <Button
            label="{$_('table.your_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.USED],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.USED}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.USED;
            }}"
          />

          <Button
            label="{$_('table.all_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.ALL],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.ALL}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.ALL;
            }}"
          />

          <Button
            label="{$_('table.unused_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.UNUSED],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.UNUSED}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.UNUSED;
            }}"
          />
        </div>
        <div slot="body">
          {#if currentRowsOnCurrentStrategyType.length > 0 && !$vaultsLoading}
            <div class="flex flex-col space-y-4 px-4 py-4">
              {#each currentRowsOnCurrentStrategyType
                .map((obj) => obj.row)
                .filter((obj) => {
                  return $networkStore === '0x1' ? !!obj.hasConfig : obj;
                }) as strategy}
                <VaultStrategy strategy="{strategy}" />
              {/each}
            </div>
          {:else}
            <div class="flex justify-center my-4">
              <p>{noVaultsForStrategyText[currentStrategy]}</p>
            </div>
          {/if}
        </div>
      </ContainerWithHeader>
    </div>
  {/if}
</ViewContainer>
