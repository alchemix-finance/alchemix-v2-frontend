<script>
  import metrics from '../../stores/metrics';

  const getUpDownIndicator = (isIncrease) => (isIncrease ? '▲' : '▼');
  const getPlusOrMinusIndicator = (isIncrease) => (isIncrease ? '+' : '-');
</script>

<div class="flex font-alcxTitles text-lg tracking-wide justify-between">
  {#each Object.values($metrics.global) as metric}
    <div class="flex-col mr-6">
      <div class="text-bronze3 mr-2 uppercase text-sm">{metric.label}</div>
      <div class="flex">
        <div class="flex mr-2">
          <span>{metric.currency}</span>
          <span>{metric.value.toLocaleString()}</span>
          <span>{metric.metric}</span>
        </div>
        <div class="flex items-center text-{metric.percentChangedIsIncrease ? 'green1' : 'red1'}">
          <span class="text-xs mr-1">{getUpDownIndicator(metric.percentChangedIsIncrease)}</span>
          <span> {getPlusOrMinusIndicator(metric.percentChangedIsIncrease)}{metric.percentChanged}%</span>
        </div>
      </div>
    </div>
  {/each}
</div>
