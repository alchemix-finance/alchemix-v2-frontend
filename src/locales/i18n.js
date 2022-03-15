import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

// import dictionaries
import en from './dictionaries/en.json';
import de from './dictionaries/de.json';
import es from './dictionaries/es.json';
import fa from './dictionaries/fa.json';
import it from './dictionaries/it.json';
import ru from './dictionaries/ru.json';
import br from './dictionaries/br.json';
import aussie from './dictionaries/aussie.json';
import nl from './dictionaries/nl.json';
import fr from './dictionaries/fr.json';
import gr from './dictionaries/gr.json';
import hu from './dictionaries/hu.json';
import lv from './dictionaries/lv.json';
import pr from './dictionaries/pr.json';
import pt from './dictionaries/pt.json';
import tr from './dictionaries/tr.json';

// setup
addMessages('en', en);
addMessages('de', de);
addMessages('es', es);
addMessages('fa', fa);
addMessages('it', it);
addMessages('ru', ru);
addMessages('br', br);
addMessages('aussie', aussie);
addMessages('nl', nl);
addMessages('fr', fr);
addMessages('gr', gr);
addMessages('hu', hu);
addMessages('lv', lv);
addMessages('pr', pr);
addMessages('pt', pt);
addMessages('tr', tr);

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
