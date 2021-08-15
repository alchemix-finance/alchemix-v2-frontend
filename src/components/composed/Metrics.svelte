<script>
import metrics from '../../stores/metrics';
</script>

<div class="flex font-alcxTitles text-sm">
  {#each Object.values($metrics.global) as metric}
    <div class="flex mr-8">
      <div class="text-bronze1 mr-2">{metric.label}:</div>
      <div class="flex mr-2">
        <span>{metric.currency}</span>
        <span>{metric.value.toLocaleString()}</span>
        <span>{metric.metric}</span>
      </div>
      <div
        class="flex items-center text-{metric.percentChangedIsIncrease
          ? 'green1'
          : 'red1'}"
      >
        <span>(</span>
        <span class="text-xs"
          >{metric.percentChangedIsIncrease ? '▲' : '▼'}</span
        >
        <span>{metric.percentChanged}%</span>
        <span>)</span>
      </div>
    </div>
  {/each}
</div>
