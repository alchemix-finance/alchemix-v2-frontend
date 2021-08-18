<script>
import PieChart from './Charts/PieChart.svelte';
import tailwind from '../../../tailwind.config';

const CHART_COLORS = {
  orange2: tailwind.theme.colors.orange2,
  orange3: tailwind.theme.colors.orange3,
};

const legend = [
  {
    label: 'Withdrawable',
    color: CHART_COLORS.orange2,
    colorName: 'orange2',
  },
  {
    label: 'Liquidatable',
    color: CHART_COLORS.orange3,
    colorName: 'orange3',
  },
];

const title = 'Collateral';
const subTitle = '(Everything)';

const chartData = [45, 55];
</script>

<PieChart
  legend="{legend}"
  title="{title}"
  subTitle="{subTitle}"
  chartData="{chartData}"
  colors="{Object.values(CHART_COLORS)}"
/>
