<script>
import Doughtnut from './Doughnut.svelte';

export let title;
export let subTitle;

// pie chart props
// eg. { label, color, colorName }
export let legend = [];

// an array of colors -- ChartJS maps each color to each slice
// eg. ['#FE6A02', '#F4C19D']
export let colors = [];

// the percentage values for each slice to render
// eg. [45, 55] for 2 slices
export let chartData = [];

// the number of slices
const count = chartData.length;

const labels = legend.map((el) => el.label);

const getLabelColor = (label) =>
  legend.find((el) => el.label === label)?.colorName;

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
  cutout: '85%',

  // no border
  borderWidth: 0,

  // space between each curve
  spacing: 15,

  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    tooltip: {
      // the design currently doesn't show tooltips
      // and because we use `transform` to skew the inclination of the chart
      // the tooltips are skewed and inclined as a result. For now, let's disable them
      enabled: false,
    },
    legend: {
      // because we use `transform` to skew the inclination of the chart
      // the legend is also skewed/inclined. As a result, we'll need to re-create one.
      display: false,
    },
  },
};
</script>

<style>
.inclined {
  transform: skewX(-8deg) rotate3d(100, -10, 10, 40deg);
}
</style>

<div class="bg-grey10 px-16 py-8 rounded-md">
  <div class="flex justify-between">
    <div>
      <div class="font-alcxTitles text-2xl leading-8">
        {title}
      </div>
      <div class="font-alcxTitles text-lightgrey1">{subTitle}</div>
    </div>
    <div class="flex-col">
      {#each labels as label}
        <div class="flex items-center mb-1">
          <div class="rounded w-10 h-2 bg-{getLabelColor(label)} mr-10"></div>
          <div>{label}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="inclined">
    <Doughtnut data="{data}" options="{options}" />
  </div>
</div>
