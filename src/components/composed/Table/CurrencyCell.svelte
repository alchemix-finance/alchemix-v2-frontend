<script>
import global from '../../../stores/global';
import settings from '../../../stores/settings';

export let value;
export let prefix;
let normalizedValue;

const normalize = () => {
  normalizedValue = parseFloat((value || 0) * $global.conversionRate).toFixed(2);
};

$: value, normalize();
$: $settings, normalize();
</script>

{#if prefix}{prefix}{/if}{normalizedValue}
{$settings.baseCurrency?.symbol || '$'}
