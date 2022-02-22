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

  let totalDebtLimitFormatted = 0;
  let totalDebtFormatted = 0;
  let totalInterestFormatted = 0;
  let withdrawable = 0;
  let totalDepositFormatted = 0;
  let aggregatedApy = 0;
  let apys = [];

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
    const debtValue = depositValue / ratio;
    const tvlValue = calculateBalanceValue(
      vault.tvl,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    const vaultDebt = calculateVaultDebt(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      $vaultsStore[vault.type].ratio,
    );
    const vaultWithdraw = depositValue - vaultDebt * ratio;
    // console.log(vaultWithdraw);
    const vaultApy = Math.round(vault.apy * 10000) / 100;
    // console.log(vaultApy);
    // totalDepositFormatted += depositValue;
    if (vaultDebt.gt(BigNumber.from(0))) {
      parseFloat(vaultDebt.toString());
    } else {
      totalInterestFormatted += parseFloat(vaultDebt.toString());
    }
    // apys.push(vaultApy);
    // totalDebtLimitFormatted += debtValue;
    // withdrawable += vaultWithdraw;
    // if (index + 1 === vaults.length) {
    //   console.log(
    //     aggregatedApy,
    //     totalDebtLimitFormatted,
    //     totalDebtFormatted,
    //     totalInterestFormatted,
    //     withdrawable,
    //     totalDepositFormatted,
    //   );
    //   aggregatedApy = apys.reduce((prev, curr) => prev + curr) / apys.length;
    //   totalDebtLimitFormatted = parseFloat(totalDebtLimitFormatted).toFixed(2);
    //   totalDebtFormatted = parseFloat(totalDebtFormatted).toFixed(2);
    //   totalInterestFormatted = parseFloat(totalInterestFormatted).toFixed(2);
    //   withdrawable = parseFloat(withdrawable).toFixed(2);
    //   totalDepositFormatted = parseFloat(totalDepositFormatted).toFixed(2);
    //   aggregatedApy = parseFloat(aggregatedApy.toString()).toFixed(2);
    // }
    return {
      ratio,
      depositValue,
      debtValue,
      vaultDebt: parseFloat(vaultDebt.toString()) > 0 ? parseFloat(vaultDebt.toString()) : 0,
      vaultInterest: parseFloat(vaultDebt.toString()) < 0 ? parseFloat(vaultDebt.toString()) : 0,
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

  $: totalDebt = aggregate.map((val) => val.vaultDebt).reduce((prev, curr) => prev + curr);
  $: debtLimit = aggregate.map((val) => val.debtValue).reduce((prev, curr) => prev + curr);
  $: totalDeposit = aggregate.map((val) => val.depositValue).reduce((prev, curr) => prev + curr);
  $: vaultApy =
    aggregate.map((val) => val.vaultApy).reduce((prev, curr) => prev + curr) /
    aggregate.map((val) => val.vaultApy).length;
  $: totalWithdraw = aggregate.map((val) => val.vaultWithdraw).reduce((prev, curr) => prev + curr);
  $: totalInterest = aggregate.map((val) => val.vaultInterest).reduce((prev, curr) => prev + curr);

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
            if (this.getLabelForValue(val)[0].toUpperCase() === $_('table.withdrawable').toUpperCase()) {
              return [...this.getLabelForValue(val), `${toFiat(totalWithdraw)}`];
            } else if (this.getLabelForValue(val)[0].toUpperCase() === $_('chart.debt').toUpperCase()) {
              return [...this.getLabelForValue(val), `${toFiat(totalDebt)}`];
            } else if (this.getLabelForValue(val)[0].toUpperCase() === $_('chart.interest').toUpperCase()) {
              return [...this.getLabelForValue(val), `${toFiat(totalInterest)}`];
            }

            return [...this.getLabelForValue(val), ``];
          },
        },
      },
      y: {
        suggestedMax: Math.floor(totalDeposit),

        ticks: {
          stepSize: 1,
          padding: 10,
          callback: function (value) {
            const values = [0, Math.round(totalDebt), Math.round(totalDeposit)];
            if ([0, Math.round(totalDebt), Math.round(totalDeposit)].includes(value)) {
              return values.reduce((prev, curr) => {
                console.log(value, prev, curr);
                return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
              });
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
            console.log(context.tick.value);
            return [debtLimit, totalDeposit].reduce((prev, curr) => {
              return Math.abs(curr - context.tick.value) < Math.abs(prev - context.tick.value)
                ? ORANGE
                : GREEN;
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
          <span class="text-lg">{toFiat(totalDeposit)}</span>
        </div>
        <div class="mr-8 flex items-center">
          <span class="text-green1 mr-05">
            <span>-</span>
            <span class="mx">-</span>
            <span>-</span>
          </span>
          <span class="mx-2 text-grey2">{$_('table.debt_limit')}</span>
          <span class="text-lg">{toFiat(debtLimit)}</span>
        </div>
        <div class="flex items-center">
          <span class="text-grey2 mr-2">{$_('chart.aggregate_apy')}</span>
          <span class="text-lg"
            >{vaultApy.toFixed(2)}
            %</span
          >
        </div>
      </div>
    </div>
    <BarChart data="{data}" options="{options}" />
  </div>
</div>
