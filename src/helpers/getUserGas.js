import settings from '../stores/settings';
import global from '../stores/global';

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
 * @returns gas price as int
 * */
export default function getUserGas() {
  const gas = _global.gasPrices[`${_settings.defaultGas}`];
  return gas.baseFeePerGas + gas.maxPriorityFeePerGas;
}
