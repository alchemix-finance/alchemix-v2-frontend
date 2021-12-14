<script>
/*
 * @dev this file ensures proper i18n support on storybook
 * */
import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

// import dictionaries
import en from '../locales/dictionaries/en.json';
import de from '../locales/dictionaries/de.json';
import es from '../locales/dictionaries/es.json';
import fa from '../locales/dictionaries/fa.json';
import it from '../locales/dictionaries/it.json';
import ru from '../locales/dictionaries/ru.json';

// setup
addMessages('en', en);
addMessages('de', de);
addMessages('es', es);
addMessages('fa', fa);
addMessages('it', it);
addMessages('ru', ru);

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});
</script>

<slot />
