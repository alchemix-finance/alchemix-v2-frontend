<script>
import { onMount } from 'svelte';
import BarChart from './Charts/BarChart.svelte';
import tailwind from '../../../tailwind.config';

// TODO: use tailwind exported colors everywhere
const LIGHT_GREY = '#2F323E';
const GREEN = '#3Db516';
const ORANGE = tailwind.theme.colors.orange2;
const OFF_BLACK = '#202128';

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
    },
    y: {
      suggestedMax: 10000,

      ticks: {
        callback: function (value) {
          if ([0, 5000, 10000].includes(value)) {
            return value.toLocaleString();
          }

          return undefined;
        },
      },

      grid: {
        // set bottom-most axis line to light grey
        borderColor: LIGHT_GREY,

        // width and space of dotted lines
        borderDash: [4, 4],

        // the width of the line between the tick label and the vertical grey
        // bar at position 0 on x axis
        tickBorderDash: [6],
        // tickBorderDashOffset: 10,

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

<div class="bg-grey10 px-16 py-8 rounded-md h-80">
  <BarChart data="{data}" options="{options}" />
</div>
