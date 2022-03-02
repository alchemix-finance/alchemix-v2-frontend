import { IFarmAdapter } from '@stores/v2/adapters/IFarmAdapter';
import { CurveFarmType } from '@stores/v2/types';
import { utils } from 'ethers';

export class CRVFarmAdapter extends IFarmAdapter {
  getApy() {
    return 0;
  }

  getFarm() {
    return this.genericFarm as CurveFarmType;
  }

  getTvl() {
    return utils.formatEther(this.getFarm().tvl || this.getFarm().tvl[0]);
  }
}
