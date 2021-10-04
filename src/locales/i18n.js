import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

// import dictionaries
import en from './dictionaries/en.json';
import de from './dictionaries/de.json';

// setup
addMessages('en', en);
addMessages('de', de);

const localSettings = JSON.parse(localStorage.getItem('settings'));

if (!!localSettings) {
  init({
    fallbackLocale: 'en',
    initialLocale: localSettings.userLanguage.locale || getLocaleFromNavigator(),
  });
} else {
  init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator(),
  });
}
