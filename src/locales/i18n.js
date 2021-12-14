import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

// import dictionaries
import en from './dictionaries/en.json';
import de from './dictionaries/de.json';
import es from './dictionaries/es.json';
import fa from './dictionaries/fa.json';
import it from './dictionaries/it.json';
import ru from './dictionaries/ru.json';



// setup
addMessages('en', en);
addMessages('de', de);
addMessages('es', es);
addMessages('fa', fa);
addMessages('it', it);
addMessages('ru', ru);


const localSettings = JSON.parse(localStorage.getItem('settings'));

if (localSettings !== undefined && localSettings !== null) {
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
