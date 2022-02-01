import { modalReset } from 'stores/modal';
import { vaultsReset } from 'stores/vaults';
import { transmutersReset } from 'stores/transmuters';
import { tempTxReset } from 'stores/tempTx';
import { toastReset } from 'stores/toast';
import { stakingPoolsReset } from 'stores/stakingPools';
import { networkReset } from 'stores/network';
import { accountReset } from 'stores/account';
import { allowancesReset } from 'stores/allowances';
import { globalReset } from 'stores/global';
import { governanceReset } from 'stores/governance';
import { metricsReset } from 'stores/metrics';
import { walletBalanceReset } from 'stores/walletBalance';
import { getFiatRates, getTokenPrices } from '../middleware/zapper';

export function uninitData() {
  vaultsReset();
  transmutersReset();
  tempTxReset();
  toastReset();
  stakingPoolsReset();
  networkReset();
  accountReset();
  allowancesReset();
  globalReset();
  governanceReset();
  metricsReset();
  modalReset();
  walletBalanceReset();
  getFiatRates();
  getTokenPrices();
}
