<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import global from '@stores/global';
  import settings from '@stores/settings';
  import { balancesStore, vaultsStore } from '@stores/v2/alcxStore';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';

  export let vaults;

  const getUpDownIndicator = (isIncrease) => (isIncrease ? '▲' : '▼');
  const getPlusOrMinusIndicator = (isIncrease) => (isIncrease ? '+' : '-');

  const calculateBalanceValue = (_balance, _perShare, _decimals, _price) => {
    return (
      parseFloat(
        utils.formatUnits(_balance.mul(_perShare).div(BigNumber.from(10).pow(_decimals)), _decimals),
      ) * _price
    );
  };

  const toFiat = (_amount) => {
    return new Intl.NumberFormat($settings.userLanguage.locale, {
      style: 'currency',
      currency: $settings.baseCurrency.symbol,
    }).format(parseFloat((_amount * $global.conversionRate).toFixed(2)));
  };

  $: aggregate = vaults.map((vault) => {
    const underlyingTokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);
    const tokenPrice = $global.tokenPrices.find(
      (token) => token.address.toLowerCase() === underlyingTokenData.address.toLowerCase(),
    )?.price;
    const ratio = parseFloat(utils.formatEther($vaultsStore[vault.type].ratio));

    const depositValue = calculateBalanceValue(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    const debtLimit = depositValue / ratio;
    const tvlValue = calculateBalanceValue(
      vault.tvl,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    const vaultDebt = parseFloat(utils.formatEther($vaultsStore[vault.type].debt.debt)) * tokenPrice;
    const rawWithdraw = depositValue - vaultDebt * ratio;
    const vaultWithdraw = rawWithdraw < 0 ? 0 : rawWithdraw;
    return {
      vaultType: vault.type,
      token: vault.debtTokenAddress,
      ratio,
      depositValue,
      debtLimit,
      tvlValue,
      vaultDebt: vaultDebt > 0 ? vaultDebt : 0,
      vaultWithdraw,
    };
  });

  $: totalDeposit = aggregate.map((val) => val.depositValue).reduce((prev, curr) => prev + curr);
  $: totalDepositFiat = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat((totalDeposit * $global.conversionRate).toFixed(2)));
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
  }).format(parseFloat((openDebt * $global.conversionRate).toFixed(2)));
  $: openCreditRaw = aggregate.map((val) => val.debtLimit).reduce((prev, curr) => prev + curr) - openDebt;
  $: openCredit = openCreditRaw < 0 ? openCreditRaw * -1 : openCreditRaw;
  $: openCreditFiat = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat((openCredit * $global.conversionRate).toFixed(2)));
  $: tvl = aggregate.map((val) => val.tvlValue).reduce((prev, curr) => prev + curr);
  $: tvlFiat = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency: $settings.baseCurrency.symbol,
  }).format(parseFloat((tvl * $global.conversionRate).toFixed(2)));
</script>

<div class="flex font-alcxTitles text-lg tracking-wide justify-between">
  <div class="flex-col mr-6">
    <div class="text-bronze3 mr-2 uppercase text-sm">{$_('metrics.total_deposit')}</div>
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

  <div class="flex-col mr-6">
    <div class="text-bronze3 mr-2 uppercase text-sm">{$_('metrics.open_debt')}</div>
    <div class="flex">
      <div class="flex mr-2">
        {openDebtFiat}
      </div>
    </div>
  </div>

  <div class="flex-col mr-6">
    <div class="text-bronze3 mr-2 uppercase text-sm">{$_('metrics.open_credit')}</div>
    <div class="flex">
      <div class="flex mr-2">
        {openCreditFiat}
      </div>
    </div>
  </div>

  <div class="flex-col mr-6">
    <div class="text-bronze3 mr-2 uppercase text-sm">{$_('metrics.global_tvl')}</div>
    <div class="flex">
      <div class="flex mr-2">
        {tvlFiat}
      </div>
    </div>
  </div>
</div>
