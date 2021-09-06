<script>
import metrics from '../../stores/metrics';

const getUpDownIndicator = (isIncrease) => (isIncrease ? '▲' : '▼');
const getPlusOrMinusIndicator = (isIncrease) => (isIncrease ? '+' : '-');
</script>

<div class="flex font-alcxTitles text-sm">
  {#each Object.values($metrics.global) as metric}
    <div class="flex mr-6">
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
        <span class="text-xs mr-2"
          >{getUpDownIndicator(metric.percentChangedIsIncrease)}</span
        >
        <span>
          {getPlusOrMinusIndicator(
            metric.percentChangedIsIncrease,
          )}{metric.percentChanged}%</span
        >
        <span>)</span>
      </div>
    </div>
  {/each}
</div>
