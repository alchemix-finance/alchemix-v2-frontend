<script>
import PieChart from './Charts/PieChart.svelte';
import tailwind from '../../../tailwind.config';
import { _ } from 'svelte-i18n';

const CHART_COLORS = {
  orange2: tailwind.theme.colors.orange2,
  orange3: tailwind.theme.colors.orange3,
};

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

const title = $_('collateral');
const subTitle = `(${$_('everything')})`;

let chartData = [45, 55];

setTimeout(() => {
  console.log('Chart Updated');
  chartData = [10, 90];
}, 2000);
</script>

<PieChart
  legend="{legend}"
  title="{title}"
  subTitle="{subTitle}"
  chartData="{chartData}"
  colors="{Object.values(CHART_COLORS)}"
/>
