import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

// import dictionaries
import en from './dictionaries/en.json';

// setup
addMessages('en', en);

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});
