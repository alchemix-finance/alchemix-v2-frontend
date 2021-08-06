import global from '../stores/global';
import settings from '../stores/settings';

let _settings;
let _global;

settings.subscribe((val) => {
  _settings = val;
});

global.subscribe((val) => {
  _global = val;
});

// @dev writes new conversion rate to state
function newConversionRate() {
  _global.conversionRate = _global.fiatRates[_settings.baseCurrency.symbol];
  global.set({ ..._global });
}

export { newConversionRate };
