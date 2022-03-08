import { IFarmAdapter } from '@stores/v2/adapters/IFarmAdapter';
import { SushiFarmType } from '@stores/v2/types';
import { utils } from 'ethers';

export class SushiFarmAdapter extends IFarmAdapter {
  getApy() {
    const { underlyingAddresses, rewardRates, slpTotalSupply, totalDeposit } = this.getFarm();

    const _price1 = this.getPrice(underlyingAddresses[1]);

    const _fTokenPriceSushi = this.getPrice('0x6b3595068778dd592e39a122f4f5a5cf09c90fe2');

    const _fSushiPerWeek = parseFloat(utils.formatEther(rewardRates[1])) * 45000;
    const _fALCXPerWeek = parseFloat(utils.formatEther(rewardRates[0])) * 45000;

    const _fTotalSupply = parseFloat(utils.formatEther(slpTotalSupply));
    const _fTotalDeposit = parseFloat(utils.formatEther(totalDeposit));
    const _fTvl = this.getTvl();

    const _fPriceSLP = _fTvl / _fTotalSupply;

    const _fApy =
      ((_fSushiPerWeek * _fTokenPriceSushi * 52 + _fALCXPerWeek * _price1 * 52) /
        (_fTotalDeposit * _fPriceSLP)) *
      100;

    return _fApy.toFixed(3);
  }

  getFarm() {
    return this.genericFarm as SushiFarmType;
  }

  getTvl() {
    const { underlyingAddresses, tvl } = this.getFarm();

    const _price0 = this.getPrice(underlyingAddresses[0]);
    const _price1 = this.getPrice(underlyingAddresses[1]);
    const _value0 = parseFloat(utils.formatEther(tvl[0])) * _price0;
    const _value1 = parseFloat(utils.formatEther(tvl[1])) * _price1;
    return _value0 + _value1;
  }
}
