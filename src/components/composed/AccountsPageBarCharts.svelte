<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import { onMount, onDestroy } from 'svelte';
  import global from '../../stores/global';
  import settings from '../../stores/settings';
  import BarChart from './Charts/BarChart.svelte';
  import tailwind from '../../../tailwind.config';
  import { VaultTypes } from '@stores/v2/types';
  import { AllowedVaultTypes, VaultTypesInfos } from '@stores/v2/constants';
  import { calculateVaultDebt, getTokenDataFromBalances } from '@stores/v2/helpers';
  import { balancesStore, vaultsStore } from '@stores/v2/alcxStore';

  export let vaults;

  const calculateBalanceValue = (_balance, _perShare, _decimals, _price) => {
    return (
      parseFloat(
        utils.formatUnits(_balance.mul(_perShare).div(BigNumber.from(10).pow(_decimals)), _decimals),
      ) * _price
    );
  };

  $: aggregate = vaults.map((vault, index) => {
    const vaultTokenData = getTokenDataFromBalances(vault.address, [$balancesStore]);
    const underlyingTokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);
    const tokenPrice = $global.tokenPrices.find(
      (token) => token.address.toLowerCase() === underlyingTokenData.address.toLowerCase(),
    )?.price;
    const depositValue = calculateBalanceValue(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    const ratio = parseFloat(utils.formatEther($vaultsStore[vault.type].ratio));
    const debtLimit = depositValue / ratio;
    const tvlValue = calculateBalanceValue(
      vault.tvl,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    const vaultDebt = parseFloat(utils.formatEther($vaultsStore[vault.type].debt.debt)) * tokenPrice;
    const rawWithdraw = depositValue - vaultDebt * ratio;
    const vaultWithdraw = rawWithdraw < 0 ? 0 : rawWithdraw;
    const vaultApy = Math.round(vault.apy * 10000) / 100;
    return {
      vaultType: vault.type,
      token: vault.debtTokenAddress,
      ratio,
      depositValue,
      debtLimit,
      vaultDebt: vaultDebt > 0 ? vaultDebt : 0,
      vaultInterest: vaultDebt < 0 ? vaultDebt * -1 : 0,
      vaultWithdraw,
      vaultApy,
    };
  });

  const toFiat = (amount) => {
    return new Intl.NumberFormat($settings.userLanguage.locale, {
      style: 'currency',
      currency: $settings.baseCurrency.symbol,
    }).format(parseFloat((amount * $global.conversionRate).toFixed(2)));
  };

  // TODO: use tailwind exported colors everywhere
  const GREY = '#74767C';
  const LIGHT_GREY = '#2F323E';
  const GREEN = '#3Db516';
  const ORANGE = tailwind.theme.colors.orange2;
  const OFF_BLACK = '#202128';

  const MONTSERRAT = 'Montserrat, sans-serif';

  let background1;

  let canvas;
  let context;

  onMount(() => {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    let background1Gradient = context.createLinearGradient(0, 0, 0, 300);
    background1Gradient.addColorStop(0, ORANGE);
    background1Gradient.addColorStop(0.99, OFF_BLACK);

    background1 = background1Gradient;

    // TODO: still need to figure out how to do different gradients per bar
    // Found some tutorials here:
    // https://stackoverflow.com/questions/60679709/chart-js-add-gradient-to-bar-chart
    // https://stackoverflow.com/questions/40221565/how-to-show-gradient-vertically-on-chart-js-grouped-bar-chart

    context.fillStyle = background1;
  });
  $: totalDebt = aggregate
    .reduce((list, item) => {
      if (!list.some((obj) => obj.vaultType === item.vaultType)) {
        list.push(item);
      }
      return list;
    }, [])
    .map((val) => val.vaultDebt)
    .reduce((prev, curr) => prev + curr);
  $: lockedDeposit = aggregate
    .reduce((list, item) => {
      if (!list.some((obj) => obj.vaultType === item.vaultType)) {
        list.push(item);
      }
      return list;
    }, [])
    .map((val) => val.vaultDebt * val.ratio)
    .reduce((prev, curr) => prev + curr);
  $: debtLimit = aggregate.map((val) => val.debtLimit).reduce((prev, curr) => prev + curr);
  $: totalDeposit = aggregate.map((val) => val.depositValue).reduce((prev, curr) => prev + curr);
  $: userApy = aggregate.filter((val) => val.depositValue !== 0);
  $: vaultApy =
    userApy.map((val) => val.vaultApy).reduce((prev, curr) => prev + curr) /
    userApy.map((val) => val.vaultApy).length;
  $: totalWithdraw = totalDeposit - lockedDeposit;
  $: totalInterest = aggregate.map((val) => val.vaultInterest).reduce((prev, curr) => prev + curr);
  $: fiatDeposit = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat(((totalDeposit || 0) * $global.conversionRate).toFixed(2)));
  $: fiatWithdraw = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat(((totalWithdraw || 0) * $global.conversionRate).toFixed(2)));
  $: fiatDebtLimit = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat(((debtLimit || 0) * $global.conversionRate).toFixed(2)));
  $: fiatDebt = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat((totalDebt * $global.conversionRate).toFixed(2)));
  $: fiatInterest = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat(((totalInterest || 0) * $global.conversionRate).toFixed(2)));

  $: data = {
    labels: [[$_('table.withdrawable')], [$_('chart.debt')], [$_('chart.interest')]],
    datasets: [
      {
        // data: [
        //   aggregate.map((val) => val.vaultWithdraw).reduce((prev, curr) => prev + curr),
        //   totalDebtFormatted || 0,
        //   totalInterestFormatted || 0,
        // ],
        data: [totalWithdraw, totalDebt, totalInterest],
        backgroundColor: [background1],
        borderRadius: 5,
      },
    ],
  };

  function between(x, min, max) {
    return x >= min && x <= max;
  }

  $: options = {
    responsive: true,
    maintainAspectRatio: false,

    defaultFontFamily: MONTSERRAT,

    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },

    scales: {
      x: {
        grid: {
          // set left-most axis line to light grey
          borderColor: LIGHT_GREY,
        },

        ticks: {
          padding: 6,
          font: {
            size: 16,
            family: MONTSERRAT,
          },
          callback: function (val, index, c) {
            // this sets the numerical values and labels for the bars
            if (this.getLabelForValue(val)[0].toUpperCase() === $_('table.withdrawable').toUpperCase()) {
              return [...this.getLabelForValue(val), `${fiatWithdraw}`];
            } else if (this.getLabelForValue(val)[0].toUpperCase() === $_('chart.debt').toUpperCase()) {
              return [...this.getLabelForValue(val), `${fiatDebt}`];
            } else if (this.getLabelForValue(val)[0].toUpperCase() === $_('chart.interest').toUpperCase()) {
              return [...this.getLabelForValue(val), `${fiatInterest}`];
            }

            return [...this.getLabelForValue(val), ``];
          },
        },
      },
      y: {
        suggestedMax: totalDeposit,

        ticks: {
          stepSize: 1,
          padding: 10,
          callback: function (value) {
            // this iterates over _all_ ticks and should return ticks that match 0, debtLimit and totalDeposit
            // it also generates the labels on the y axis and creates a callback for each label

            const floorDebt = Math.floor(debtLimit);
            const floorDeposit = Math.floor(totalDeposit);

            if (value === 0) return value;

            // sometimes creates duplicate entries that'll overlap, needs some better fixing
            if (
              [
                0,
                ...Array(10)
                  .fill(floorDebt - 5)
                  .map((x, y) => x + y),
                ...Array(10)
                  .fill(floorDeposit - 5)
                  .map((x, y) => x + y),
              ].includes(value)
            ) {
              if (between(floorDebt, value - 5, value + 5)) return fiatDebtLimit;
              if (between(floorDeposit, value - 5, value + 5)) return fiatDeposit;
            }

            return undefined;
          },

          font: {
            size: 16,
            family: MONTSERRAT,
          },
        },

        grid: {
          // set bottom-most axis line to light grey
          borderColor: LIGHT_GREY,

          // space between each dot on dotted lines
          borderDash: [4, 4],

          tickColor: GREY,

          color: (context) => {
            const roundDebt = Math.round(debtLimit);
            const roundDeposit = Math.round(totalDeposit);
            return [roundDebt, roundDeposit].reduce((prev, curr) => {
              if (between(context.tick.value, roundDebt - 5, roundDebt + 5)) return GREEN;
              if (between(context.tick.value, roundDeposit - 5, roundDeposit + 5)) return ORANGE;
              return undefined;
            });
          },
        },
      },
    },
  };
</script>

<div class="h-96">
  <div class="px-8 py-8 rounded-md h-full pb-24">
    <div class="flex justify-between font-alcxFlow pb-4 pl-2">
      <div class="flex">
        <div class="mr-8 flex items-center">
          <span class="text-orange2 mr-05">
            <span>-</span>
            <span class="mx">-</span>
            <span>-</span>
          </span>
          <span class="mx-2 text-grey2">{$_('chart.total_deposit')}</span>
          <span class="text-lg">{fiatDeposit}</span>
        </div>
        <div class="mr-8 flex items-center">
          <span class="text-green1 mr-05">
            <span>-</span>
            <span class="mx">-</span>
            <span>-</span>
          </span>
          <span class="mx-2 text-grey2">{$_('table.debt_limit')}</span>
          <span class="text-lg">{fiatDebtLimit}</span>
        </div>
        <div class="flex items-center">
          <span class="text-grey2 mr-2">{$_('chart.aggregate_apy')}</span>
          <span class="text-lg"
            >{vaultApy.toFixed(2) || 0}
            %</span
          >
        </div>
      </div>
    </div>
    <BarChart data="{data}" options="{options}" />
  </div>
</div>
