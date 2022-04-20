<script>
  import { _ } from 'svelte-i18n';
  import global from '@stores/global';
  import settings from '@stores/settings';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader';

  export let aggregate;

  // const getUpDownIndicator = (isIncrease) => (isIncrease ? '▲' : '▼');
  // const getPlusOrMinusIndicator = (isIncrease) => (isIncrease ? '+' : '-');

  const toFiat = (_amount) => {
    return new Intl.NumberFormat($settings.userLanguage.locale, {
      style: 'currency',
      currency: $settings.baseCurrency.symbol,
    }).format(parseFloat((_amount * ($global.fiatRates[$settings.baseCurrency.symbol] || 1)).toFixed(2)));
  };

  $: totalDeposit = aggregate.map((val) => val.depositValue).reduce((prev, curr) => prev + curr);
  $: totalDepositFiat = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat((totalDeposit * ($global.fiatRates[$settings.baseCurrency.symbol] || 1)).toFixed(2)));
  $: openDebt = aggregate
    .reduce((list, item) => {
      if (!list.some((obj) => obj.vaultType === item.vaultType)) {
        list.push(item);
      }
      return list;
    }, [])
    .map((val) => val.vaultDebt)
    .reduce((prev, curr) => prev + curr);
  $: openDebtFiat = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat((openDebt * ($global.fiatRates[$settings.baseCurrency.symbol] || 1)).toFixed(2)));
  $: openCreditRaw = aggregate.map((val) => val.debtLimit).reduce((prev, curr) => prev + curr) - openDebt;
  $: openCredit = openCreditRaw < 0 ? openCreditRaw * -1 : openCreditRaw;
  $: openCreditFiat = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat((openCredit * ($global.fiatRates[$settings.baseCurrency.symbol] || 1)).toFixed(2)));
  $: tvl = aggregate.map((val) => val.tvlValue).reduce((prev, curr) => prev + curr);
  $: tvlFiat = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat((tvl * ($global.fiatRates[$settings.baseCurrency.symbol] || 1)).toFixed(2)));
</script>

<div class="w-full flex flex-row space-x-4">
  <div class="grow w-full">
    <ContainerWithHeader fullWidth="{true}">
      <div slot="header" class="py-4 px-6">
        <div class="flex font-alcxTitles text-lg tracking-wide justify-between">
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

          <div class="flex-col pl-6 border-l border-dashed border-bronze3">
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
