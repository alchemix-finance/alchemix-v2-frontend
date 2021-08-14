<script>
import PieChart from './Charts/PieChart.svelte';
import tailwind from '../../../tailwind.config';

const CHART_COLORS = {
  blue6: tailwind.theme.colors.blue6,
  blue4: tailwind.theme.colors.blue4,
  blue5: tailwind.theme.colors.blue5,
};

const legend = [
  {
    label: 'Debt',
    color: CHART_COLORS.blue6,
    colorName: 'blue6',
  },
  {
    label: 'Credit',
    color: CHART_COLORS.blue4,
    colorName: 'blue4',
  },
  {
    label: 'Excess Credit',
    color: CHART_COLORS.blue5,
    colorName: 'blue5',
  },
];

const title = 'Debt/Credit';
const subTitle = '(Everything)';

const chartData = [40, 50, 10];
</script>

<PieChart
  legend="{legend}"
  title="{title}"
  subTitle="{subTitle}"
  chartData="{chartData}"
  colors="{Object.values(CHART_COLORS)}"
/>
