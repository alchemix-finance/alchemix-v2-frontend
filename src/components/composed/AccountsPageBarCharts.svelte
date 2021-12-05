<script>
import { _ } from 'svelte-i18n';
import BarChart from './Charts/BarChart.svelte';
// import { chartData, colors } from './Charts/PieChart.svelte';
import tailwind from '../../../tailwind.config';

const CHART_COLORS = {
  orange2: tailwind.theme.colors.orange2,
  green: '#3Db516', // tailwind.theme.colors.orange3,
  blue: '#16F6FF',
  grey: '#2F323E',
};

// an array of colors -- ChartJS maps each color to each slice
// eg. ['#FE6A02', '#F4C19D']
export let colors = Object.values(CHART_COLORS) || [];

const data = {
  labels: ['Widthdrawable', 'Debt', 'Interest'],
  datasets: [
    {
      label: 'Total deposited',
      data: [9000, 1000, 500],
      backgroundColor: Object.values(colors),
      borderRadius: 5,
      borderDash: [10000, 5000],
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      // because we use `transform` to skew the inclination of the chart
      // the legend is also skewed/inclined. As a result, we'll need to re-create one.
      // display: false,
      color: 'green',
      position: 'top',
    },
    title: {
      display: false,
    },
  },

  scales: {
    yAxis: {
      grid: {
        // width and space of dotted lines
        borderDash: [2, 2],

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
            return CHART_COLORS.green;
          }

          if (context.tick.value === 10000) {
            return CHART_COLORS.orange2;
          }
          return CHART_COLORS.grey;
        },
      },
    },
  },
};
</script>

<div>
  <div>Aggregate</div>
  <BarChart className="h-80" data="{data}" options="{options}" />
</div>
