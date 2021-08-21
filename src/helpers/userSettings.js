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

/*
 * @dev stores the new base currency and conversion rates in state
 * @params currency the currency object for the new base currency
 * */
export function setCurrency(currency) {
  _settings.baseCurrency = currency;
  _global.conversionRate = _global.fiatRates[_settings.baseCurrency.symbol];
  settings.set({ ..._settings });
  global.set({ ..._global });
}

/*
 * @dev stores the new user language in state
 * @params lang the language object for the new user language
 * */
export function setLanguage(lang) {
  _settings.userLanguage = lang;
  settings.set({ ..._settings });
}

/*
 * @dev stores the new default gas in state
 * @params gas the name of the new default gas
 * */
export function setGas(gas) {
  _settings.defaultGas = gas;
  settings.set({ ..._settings });
}
