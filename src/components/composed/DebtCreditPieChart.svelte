<script>
  import PieChart from './Charts/PieChart.svelte';
  import tailwind from '../../../tailwind.config';
  import { _ } from 'svelte-i18n';

  const CHART_COLORS = {
    blue6: tailwind.theme.colors.blue6,
    blue4: tailwind.theme.colors.blue4,
    blue5: tailwind.theme.colors.blue5,
  };

  const legend = [
    {
      label: $_('debt'),
      color: CHART_COLORS.blue6,
      colorName: 'blue6',
    },
    {
      label: $_('credit'),
      color: CHART_COLORS.blue4,
      colorName: 'blue4',
    },
    {
      label: $_('excess_credit'),
      color: CHART_COLORS.blue5,
      colorName: 'blue5',
    },
  ];

  const title = `${$_('debt')}/${$_('credit')}`;
  const subTitle = `(${$_('everything')})`;

  let chartData = [40, 50, 10];
</script>

<PieChart
  legend="{legend}"
  title="{title}"
  subTitle="{subTitle}"
  chartData="{chartData}"
  colors="{Object.values(CHART_COLORS)}"
/>
