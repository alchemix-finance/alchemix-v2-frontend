import { IFarmAdapter } from '@stores/v2/adapters/IFarmAdapter';
import { InternalFarmType } from '@stores/v2/types';
import { utils } from 'ethers';
import { InternalFarmsMetadata } from '@stores/v2/farmsConstants';

export class InternalFarmAdapter extends IFarmAdapter {
  getApy() {
    const { rewardRate, tvl, tokenAddress } = this.getFarm();

    const _fRewardRate = parseFloat(utils.formatEther(rewardRate));
    const _fTotalPoolDeposits = parseFloat(utils.formatEther(tvl || tvl[0]));

    const _fWethPrice = this.getPrice('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    const _fTokenprice = this.getPrice('0xdbdb4d16eda451d0503b854cf79d55697f90c8df');
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

    const _tokenPrice = this.getPrice(
      InternalFarmsMetadata[`${tokenAddress}`.toLowerCase()].tokenIcon === 'saddle'
        ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        : tokenAddress,
    );

    return parseFloat(utils.formatEther(tvl || tvl[0])) * _tokenPrice;
  }
}
