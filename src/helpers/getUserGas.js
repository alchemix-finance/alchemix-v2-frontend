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

export default function getUserGas() {
  const gas = _global.gasPrices[`${_settings.defaultGas}`];
  return gas.baseFeePerGas + gas.maxPriorityFeePerGas;
}
