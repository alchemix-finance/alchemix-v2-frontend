import { dictionary } from 'svelte-i18n';
import { get } from 'svelte/store';
import settings from '../stores/settings';

let _settings;

settings.subscribe((val) => {
  _settings = val;
});

/*
 * @param keys the dot notation string to query inside the dictionary
 * @returns the i18n string based on the user's settings
 * */
export default function getItl(keys) {
  let translation;
  try {
    translation = keys
      .split('.')
      .reduce((key, i) => key[i], get(dictionary)[`${_settings.userLanguage.locale}`]);
  } catch {
    console.log('missing translation');
  }
  return translation || keys.split('.').reduce((key, i) => key[i], get(dictionary).en);
}
