<!--
This was inspired by svelte-chartjs:
https://github.com/SauravKanchan/svelte-chartjs/blob/master/src/Base.svelte

Unfortunately, that package used an old version of chartJS
so we're re-using the src code instead to be able to support the latest chartJS internally

-->
<script>
import { onMount, afterUpdate, onDestroy } from 'svelte';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

//  Expected data
export let data = {
  labels: [],
  datasets: [{ values: [] }],
  yMarkers: {},
  yRegions: [],
};
export let type = 'line';
export let options = {};
export let plugins = {};
export let canvasClass;

let chartRef;
let chart = null;

onMount(() => {
  chart = new Chart(chartRef, {
    type,
    data,
    options,
    plugins,
  });
});

afterUpdate(() => {
  if (!chart) {
    return;
  }

  chart.data = data;
  chart.type = type;
  chart.options = options;
  chart.plugins = plugins;

  chart.update();
});

onDestroy(() => {
  chart = null;
});
</script>

<canvas id="canvas" bind:this="{chartRef}" {...$$props}></canvas>
