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

// svelte doesn't seem to like when classes are defined in a parent
// https://github.com/sveltejs/svelte/issues/2870#issuecomment-823836170
// so we need to define classes applied to the canvas by types here
const typeToClass = {
  doughnut: 'doughnut',
};
</script>

<style>
.doughnut {
  transform: scaleY(0.6);
}
</style>

<canvas class="{typeToClass[type]}" bind:this="{chartRef}" {...$$props}
></canvas>
