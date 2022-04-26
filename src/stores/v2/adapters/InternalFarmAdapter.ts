import { IFarmAdapter } from '@stores/v2/adapters/IFarmAdapter';
import { InternalFarmType } from '@stores/v2/types';
import { utils } from 'ethers';
import { InternalFarmsMetadata } from '@stores/v2/farmsConstants';

export class InternalFarmAdapter extends IFarmAdapter {
  getApy() {
    const { rewardRate, tvl, tokenAddress } = this.getFarm();

    const _fRewardRate = parseFloat(utils.formatEther(rewardRate));
    const _fTotalPoolDeposits = parseFloat(utils.formatEther(tvl || tvl[0]));

    const _fWethPrice = this.getPrice('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2').usd;
    const _fTokenprice = this.getPrice('0xdbdb4d16eda451d0503b854cf79d55697f90c8df').usd;
    const _fRewardsPerWeek = _fRewardRate * 45000;

    const _fAprSaddle =
      ((_fRewardRate * 45000 * 52 * parseFloat(_fTokenprice)) /
        (_fTotalPoolDeposits * parseFloat(_fWethPrice))) *
      100;

    const _fAprAlcx =
      ((1 + (((_fRewardsPerWeek * 52) / _fTotalPoolDeposits) * 100) / 100 / 100) ** 100 - 1) * 100;

    return (
      InternalFarmsMetadata[`${tokenAddress}`.toLowerCase()].tokenIcon === 'saddle' ? _fAprSaddle : _fAprAlcx
    ).toFixed(3);
  }

  getFarm() {
    return this.genericFarm as InternalFarmType;
  }

  getTvl() {
    const { tvl, tokenAddress } = this.getFarm();

    enum TokenOverride {
      SADDLE = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      TOKEMAK = '0xdbdb4d16eda451d0503b854cf79d55697f90c8df',
    }

    const lookupValue = InternalFarmsMetadata[`${tokenAddress}`.toLowerCase()].tokenIcon?.toUpperCase();
    const _tokenPrice = this.getPrice(
      Object.keys(TokenOverride).includes(lookupValue) ? TokenOverride[`${lookupValue}`] : tokenAddress,
    );

    return [
      {
        tvl: utils.formatEther(tvl || tvl[0]),
        tokenPrice: _tokenPrice,
        tokenAddress,
      },
    ];
  }
}
