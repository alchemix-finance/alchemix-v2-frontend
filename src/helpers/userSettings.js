import { init, getLocaleFromNavigator } from 'svelte-i18n';
import global from '../stores/global';
import settings from '../stores/settings';
import toastConfig from '../stores/toast';

let _settings;
let _global;
let _toastConfig;

settings.subscribe((val) => {
  _settings = val;
});

global.subscribe((val) => {
  _global = val;
});

toastConfig.subscribe((val) => {
  _toastConfig = val;
});

/*
 * @dev stores the new boolean for development purposes
 * @param state the new setting
 * */
export function setVerbose(state) {
  _settings.verboseConsole = state;
  settings.set({ ..._settings });
}

/*
 * @dev stores the new base currency and conversion rates in state
 * @param currency the currency object for the new base currency
 * */
export function setCurrency(currency) {
  _settings.baseCurrency = currency;
  _global.conversionRate = _global.fiatRates[_settings.baseCurrency.symbol];
  _toastConfig.spinner = false;
  _toastConfig.showCloseButton = false;
  _toastConfig.kind = 'success';
  _toastConfig.title = 'Currency updated';
  _toastConfig.subtitle = `Using ${currency.symbol} as default`;
  _toastConfig.closeTimeout = 2500;
  _toastConfig.visible = true;
  settings.set({ ..._settings });
  global.set({ ..._global });
  toastConfig.set({ ..._toastConfig });
}

/*
 * @dev stores the new user language in state
 * @param lang the language object for the new user language
 * */
export function setLanguage(lang) {
  _settings.userLanguage = lang;
  _toastConfig.spinner = false;
  _toastConfig.showCloseButton = false;
  _toastConfig.kind = 'success';
  _toastConfig.title = 'Language updated';
  _toastConfig.subtitle = `Using ${lang.name} as default`;
  _toastConfig.closeTimeout = 2500;
  _toastConfig.visible = true;
  settings.set({ ..._settings });
  init({
    fallbackLocale: 'en',
    initialLocale: _settings.userLanguage.locale || getLocaleFromNavigator(),
  });
  toastConfig.set({ ..._toastConfig });
}

/*
 * @dev stores the new default gas in state
 * @param gas the name of the new default gas
 * */
export function setGas(gas) {
  _settings.defaultGas = gas;
  _toastConfig.spinner = false;
  _toastConfig.showCloseButton = false;
  _toastConfig.kind = 'success';
  _toastConfig.title = 'Gas updated';
  _toastConfig.subtitle = `Using ${gas} as default`;
  _toastConfig.closeTimeout = 2500;
  _toastConfig.visible = true;
  settings.set({ ..._settings });
  toastConfig.set({ ..._toastConfig });
}
