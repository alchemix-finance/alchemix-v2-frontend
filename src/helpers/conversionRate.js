import { get } from 'svelte/store';
import global from '../stores/global';
import settings from '../stores/settings';

let _settings;
let _global;

settings.subscribe((val) => {
  console.log(val);
  _settings = val;
});

global.subscribe((val) => {
  console.log(val);
  _global = val;
});

function newConversionRate() {
  console.log(get(global));
  const conversionRate = _global.fiatRates[_settings.baseCurrency.symbol];
  global.update(conversionRate);
}

export { newConversionRate };
