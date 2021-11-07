<script>
import { _ } from 'svelte-i18n';
import BarChart from './Charts/BarChart.svelte';
// import { chartData, colors } from './Charts/PieChart.svelte';
import tailwind from '../../../tailwind.config';

const CHART_COLORS = {
  orange2: tailwind.theme.colors.orange2,
  orange3: tailwind.theme.colors.orange3,
};

// the percentage values for each slice to render
// eg. [45, 55] for 2 slices
// export let chartData = [];
const chartData = [45, 55];

// an array of colors -- ChartJS maps each color to each slice
// eg. ['#FE6A02', '#F4C19D']
export let colors = Object.values(CHART_COLORS) || [];

const legend = [
  {
    label: $_('withdrawable'),
    color: CHART_COLORS.orange2,
    colorName: 'orange2',
  },
  {
    label: $_('liquidatable'),
    color: CHART_COLORS.orange3,
    colorName: 'orange3',
  },
];

// pie chart props
// eg. { label, color, colorName }
// export let legend = [];

const labels = legend.map((el) => el.label);

const data = {
  labels,
  datasets: [
    {
      data: chartData,
      backgroundColor: Object.values(colors),
    },
  ],
};

const options = {
  // space at the center of the pie
  // cutout: '85%',

  // no border
  // borderWidth: 0,

  // space between each curve
  // spacing: 15,

  // responsive: true,
  // maintainAspectRatio: false,

  plugins: {
    tooltip: {
      // the design currently doesn't show tooltips
      // and because we use `transform` to skew the inclination of the chart
      // the tooltips are skewed and inclined as a result. For now, let's disable them
      // enabled: false,
    },
    legend: {
      // because we use `transform` to skew the inclination of the chart
      // the legend is also skewed/inclined. As a result, we'll need to re-create one.
      // display: false,
    },
  },
};
</script>

<BarChart data="{data}" options="{options}" />
