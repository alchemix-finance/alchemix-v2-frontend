<script>
  import { _ } from 'svelte-i18n';
  import settings from '@stores/settings';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';

  export let aggregate;

  // const getUpDownIndicator = (isIncrease) => (isIncrease ? '▲' : '▼');
  // const getPlusOrMinusIndicator = (isIncrease) => (isIncrease ? '+' : '-');

  const getFormattedValue = (amount) => {
    return new Intl.NumberFormat($settings.userLanguage.locale, {
      style: 'currency',
      currency: $settings.baseCurrency.symbol,
    }).format(parseFloat(amount.toFixed(2)));
  };

  $: totalDeposit = aggregate?.map((val) => val.depositValue).reduce((prev, curr) => prev + curr);
  $: totalDepositFiat = getFormattedValue(totalDeposit);
  $: openDebt = aggregate
    ?.reduce((list, item) => {
      if (!list.some((obj) => obj.vaultType === item.vaultType)) {
        list.push(item);
      }
      return list;
    }, [])
    .map((val) => val.vaultDebt)
    .reduce((prev, curr) => prev + curr);
  $: openDebtFiat = getFormattedValue(openDebt);
  $: openCreditRaw = aggregate?.map((val) => val.debtLimit).reduce((prev, curr) => prev + curr) - openDebt;
  $: openCredit = openCreditRaw < 0 ? openCreditRaw * -1 : openCreditRaw;
  $: openCreditFiat = getFormattedValue(openCredit);
  $: tvl = aggregate?.map((val) => val.tvlValue).reduce((prev, curr) => prev + curr);
  $: tvlFiat = getFormattedValue(tvl);
</script>

<div
  class="w-full flex flex-row space-x-4 border rounded {$settings.invertColors
    ? 'bg-grey10inverse border-grey3inverse'
    : 'bg-grey10 border-grey3'}"
>
  <div class="grow w-full">
    <ContainerWithHeader fullWidth="{true}">
      <div slot="header" class="py-4 px-6">
        <div class="flex gap-2 flex-col md:flex-row font-alcxTitles text-lg tracking-wide justify-between">
          <div class="flex-col">
            <div class="text-bronze3 mr-2 uppercase text-sm whitespace-nowrap">
              {$_('metrics.total_deposit')}
            </div>
            <div class="flex">
              <div class="flex mr-2">
                {totalDepositFiat}
              </div>
              <!--      <div class="flex items-center text-{metric.percentChangedIsIncrease ? 'green1' : 'red1'}">-->
              <!--        <span class="text-xs mr-1">{getUpDownIndicator(metric.percentChangedIsIncrease)}</span>-->
              <!--        <span> {getPlusOrMinusIndicator(metric.percentChangedIsIncrease)}{metric.percentChanged}%</span>-->
              <!--      </div>-->
            </div>
          </div>

          <div class="flex-col">
            <div class="text-bronze3 mr-2 uppercase text-sm whitespace-nowrap">{$_('metrics.open_debt')}</div>
            <div class="flex">
              <div class="flex mr-2">
                {openDebtFiat}
              </div>
            </div>
          </div>

          <div class="flex-col">
            <div class="text-bronze3 mr-2 uppercase text-sm whitespace-nowrap">
              {$_('metrics.open_credit')}
            </div>
            <div class="flex">
              <div class="flex mr-2">
                {openCreditFiat}
              </div>
            </div>
          </div>

          <div
            class="flex-col border-t md:border-t-0 md:pt-0 md:pl-6 md:border-l border-dashed border-bronze3"
          >
            <div class="text-bronze3 mr-2 uppercase text-sm whitespace-nowrap">
              {$_('metrics.global_tvl')}
            </div>
            <div class="flex">
              <div class="flex mr-2">
                {tvlFiat}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContainerWithHeader>
  </div>
</div>
