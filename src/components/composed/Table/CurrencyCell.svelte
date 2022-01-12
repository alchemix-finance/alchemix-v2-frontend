<script>
import global from '../../../stores/global';
import settings from '../../../stores/settings';

export let value;
export let prefix;
export let key;
let normalizedValue;

const normalize = () => {
  normalizedValue = parseFloat((value || 0) * $global.conversionRate).toFixed(2);
};

$: value, normalize();
$: $settings, normalize();
$: key, normalize();
$: key, console.log(key, value);
</script>

{#if prefix}{prefix}{/if}{normalizedValue}
{$settings.baseCurrency?.symbol || '$'}
