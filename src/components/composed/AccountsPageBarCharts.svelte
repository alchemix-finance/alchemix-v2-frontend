<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import { onMount } from 'svelte';
  import global from '../../stores/global';
  import settings from '../../stores/settings';
  import BarChart from './Charts/BarChart.svelte';
  import tailwind from '../../../tailwind.config';
  import ChildUpdater from '../elements/ChildUpdater.svelte';

  export let totalDeposit;
  export let totalDebtLimit;
  export let aggregatedApy;
  export let totalDebt;
  export let totalInterest;
  export let totalWithdrawable;
  export let forceState;

  // $: withdrawable = (totalDeposit || 0) - (totalDebt || 0);
  // ((totalDepositFormatted || 0) * $global.conversionRate).toFixed(2)
  // FIXME debt needs a supplied ratio to calculate the proper withdrawable amount
  // $: withdrawable = (
  //   parseFloat(
  //     utils.formatEther(
  //       totalDeposit.sub(utils.parseEther(BigNumber.from(totalDebt).mul(BigNumber.from(2)).toString())),
  //     ),
  //   ) * $global.conversionRate
  // ).toFixed(2);
  $: withdrawable = totalWithdrawable;
  $: totalDepositFormatted = parseFloat(utils.formatEther(totalDeposit));
  $: totalDebtLimitFormatted = parseFloat(utils.formatEther(totalDeposit.div(BigNumber.from(2))));
  $: totalDebtFormatted = parseFloat(totalDebt.toString());
  $: console.log(totalDepositFormatted, totalDebtLimitFormatted, totalDebtFormatted);

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

  $: data = {
    labels: [[$_('table.withdrawable')], [$_('chart.debt')], [$_('chart.interest')]],
    datasets: [
      {
        data: [withdrawable || 0, totalDebtFormatted || 0, totalInterest || 0],
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
            console.log(this.getLabelForValue(val));

            if (this.getLabelForValue(val)[0].toUpperCase() === $_('table.withdrawable').toUpperCase()) {
              return [
                ...this.getLabelForValue(val),
                `${withdrawable} ${$settings.baseCurrency?.symbol || '$'}`,
              ];
            } else if (this.getLabelForValue(val)[0].toUpperCase() === $_('chart.debt').toUpperCase()) {
              return [
                ...this.getLabelForValue(val),
                `${totalDebtFormatted} ${$settings.baseCurrency?.symbol || '$'}`,
              ];
            } else if (this.getLabelForValue(val)[0].toUpperCase() === $_('chart.interest').toUpperCase()) {
              return [...this.getLabelForValue(val), `${totalInterest} %`];
            }

            return [...this.getLabelForValue(val), ``];
          },
        },
      },
      y: {
        suggestedMax: Math.floor(totalDebtLimitFormatted || 0),

        ticks: {
          stepSize: 1,
          padding: 10,
          callback: function (value) {
            if ([0, Math.floor(totalDebtLimitFormatted), Math.floor(totalDepositFormatted)].includes(value)) {
              return value.toLocaleString();
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
            console.log(context.tick);
            if (
              between(
                context.tick.value,
                Math.floor(totalDebtLimitFormatted - 10),
                Math.floor(totalDebtLimitFormatted + 10),
              )
            ) {
              return GREEN;
            }

            if (
              between(
                context.tick.value,
                Math.floor(totalDepositFormatted - 10),
                Math.floor(totalDepositFormatted + 10),
              )
            ) {
              return ORANGE;
            }

            return LIGHT_GREY;
          },
        },
      },
    },
  };

  $: normalizedDeposit = ((totalDepositFormatted || 0) * $global.conversionRate).toFixed(2);
  $: normalizedDebt = ((totalDebtLimitFormatted || 0) * $global.conversionRate).toFixed(2);
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
          <span class="text-lg">{normalizedDeposit} {$settings.baseCurrency?.symbol || '$'}</span>
        </div>
        <div class="mr-8 flex items-center">
          <span class="text-green1 mr-05">
            <span>-</span>
            <span class="mx">-</span>
            <span>-</span>
          </span>
          <span class="mx-2 text-grey2">{$_('table.debt_limit')}</span>
          <span class="text-lg">{normalizedDebt} {$settings.baseCurrency?.symbol || '$'}</span>
        </div>
        <div class="flex items-center">
          <span class="text-grey2 mr-2">{$_('chart.aggregate_apy')}</span>
          <span class="text-lg">{aggregatedApy}%</span>
        </div>
      </div>
    </div>
    <BarChart data="{data}" options="{options}" />
  </div>
</div>
