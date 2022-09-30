import settings from '../stores/settings';
import global from '../stores/global';
import { getGasPrices } from '@middleware/zapper';

let _settings;
let _global;

settings.subscribe((val) => {
  _settings = val;
});

global.subscribe((val) => {
  _global = val;
});

/*
 * @dev fetches the default gas from storage that's set by the user
 * @param timeout optional, sets timeout for axios request
 * @returns gas price as int
 * */
export default async function getUserGas(timeout) {
  await getGasPrices(timeout || 0);
  return _global.gasPrices[`${_settings.defaultGas}`];
}
