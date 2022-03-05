import { utils, ethers } from 'ethers';
import settings from '../stores/settings';
import global from '../stores/global';
import { getGasPrices } from '../middleware/zapper';
import { setPendingGas } from './setToast';

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
  const gas = _global.gasPrices[`${_settings.defaultGas}`];
  return gas.baseFeePerGas + gas.maxPriorityFeePerGas;
}

/*
 * @dev failsafe for transactions in the case zapper does not work
 * @returns formatted gas
 * */
export async function gasResolver() {
  setPendingGas();
  const provider = ethers.getDefaultProvider();
  const gastimate = await provider.getGasPrice();
  let gas;
  try {
    const temp = await getUserGas(1500);
    gas = utils.parseUnits(temp.toString(), 'gwei');
  } catch (e) {
    console.info('[helpers/getUserGas]: Fetching gas price failed, resorting to provider', e);
  }
  return gastimate.gt(gas) ? gastimate : gas;
}
