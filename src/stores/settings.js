import { writable } from 'svelte/store';

const localSettings = JSON.parse(localStorage.getItem('settings'));

const settings = writable(
  localSettings || {
    baseCurrency: {
      symbol: 'USD',
      ticker: '$',
    },
    userLanguage: {
      name: 'English',
      locale: 'en',
    },
    defaultGas: 'standard',
    verboseConsole: false,
  },
);

settings.subscribe((value) => {
  localStorage.setItem('settings', JSON.stringify(value));
});

export default settings;
