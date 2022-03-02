import { GenericFarmType } from '@stores/v2/types';

export abstract class IFarmAdapter {
  genericFarm: GenericFarmType;

  priceStore: any;

  protected constructor(farm: GenericFarmType, priceStore: any) {
    this.genericFarm = farm;
    this.priceStore = priceStore;
  }

  getPrice(tokenAddress: string) {
    return this.priceStore.find((entry) => `${entry}`.toLowerCase() === `${tokenAddress}`.toLowerCase());
  }

  abstract getApy();
  abstract getTvl();
  abstract getFarm();
}
