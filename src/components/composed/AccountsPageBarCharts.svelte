<script>
import { onMount } from 'svelte';
import BarChart from './Charts/BarChart.svelte';
import tailwind from '../../../tailwind.config';

// TODO: use tailwind exported colors everywhere
const GREY = '#74767C';
const LIGHT_GREY = '#2F323E';
const GREEN = '#3Db516';
const ORANGE = tailwind.theme.colors.orange2;
const OFF_BLACK = '#202128';

const MONTSERRAT = 'Montserrat, sans-serif';

let background1;

onMount(() => {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

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

const data = {
  labels: ['Widthdrawable', 'Debt', 'Interest'],
  datasets: [
    {
      label: 'Total deposited',
      data: [9000, 4000, 2000],
      backgroundColor: [background1],
      borderRadius: 5,
    },
  ],
};

const options = {
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
      },
    },
    y: {
      suggestedMax: 10000,

      ticks: {
        padding: 10,

        callback: function (value) {
          if ([0, 5000, 10000].includes(value)) {
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
          /*
            index: 2
            type: "tick"s
            tick: {
              $context: {tick: {…}, index: 2, type: 'tick'}
              label: "2,000"
              value: 2000
            }
          */

          if (context.tick.value === 5000) {
            return GREEN;
          }

          if (context.tick.value === 10000) {
            return ORANGE;
          }

          return LIGHT_GREY;
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
          <span class="mx-2 text-grey2">Total Deposit</span>
          <span class="text-lg">10,000</span>
        </div>
        <div class="mr-8 flex items-center">
          <span class="text-green1 mr-05">
            <span>-</span>
            <span class="mx">-</span>
            <span>-</span>
          </span>
          <span class="mx-2 text-grey2">Debt Limit</span>
          <span class="text-lg">10,000</span>
        </div>
        <div class="flex items-center">
          <span class="text-grey2 mr-2">Aggregate APY</span>
          <span class="text-lg">342%</span>
        </div>
      </div>
      <div class="border border-grey3 rounded p-2 py-0.5 bg-grey10">
        <span class="text-grey2 mr-2">Today</span>
        <span class="text-lg">Sept 21, 2020</span>
      </div>
    </div>
    <BarChart data="{data}" options="{options}" />
  </div>
</div>
