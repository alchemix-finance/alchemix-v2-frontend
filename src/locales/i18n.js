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
import af from './dictionaries/af.json';
import ar from './dictionaries/ar.json';
import ca from './dictionaries/ca.json';
import cn from './dictionaries/cn.json';
import cs from './dictionaries/cs.json';
import da from './dictionaries/da.json';
import el from './dictionaries/el.json';
import fi from './dictionaries/fi.json';
import he from './dictionaries/he.json';
import ja from './dictionaries/ja.json';
import ko from './dictionaries/ko.json';
import no from './dictionaries/no.json';
import pl from './dictionaries/pl.json';
import ro from './dictionaries/ro.json';
import sr from './dictionaries/sr.json';
import sv from './dictionaries/sv.json';
import tw from './dictionaries/tw.json';
import uk from './dictionaries/uk.json';
import vi from './dictionaries/vi.json';

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
addMessages('af', af);
addMessages('ar', ar);
addMessages('ca', ca);
addMessages('cn', cn);
addMessages('cs', cs);
addMessages('da', da);
addMessages('el', el);
addMessages('fi', fi);
addMessages('he', he);
addMessages('ja', ja);
addMessages('ko', ko);
addMessages('no', no);
addMessages('pl', pl);
addMessages('ro', ro);
addMessages('sr', sr);
addMessages('sr', sr);
addMessages('sv', sv);
addMessages('tw', tw);
addMessages('uk', uk);
addMessages('vi', vi);

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
