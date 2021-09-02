<script>
/*
 * @dev this file ensures proper i18n support on storybook
 * */
import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

// import dictionaries
import en from '../locales/dictionaries/en.json';
import de from '../locales/dictionaries/de.json';

// setup
addMessages('en', en);
addMessages('de', de);

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});
</script>

<slot />
