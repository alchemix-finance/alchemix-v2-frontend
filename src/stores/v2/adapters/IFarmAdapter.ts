import { GenericFarmType } from '@stores/v2/types';

export abstract class IFarmAdapter {
  genericFarm: GenericFarmType;

  priceStore: any = [];

  protected constructor(farm: GenericFarmType, priceStore: any) {
    this.genericFarm = farm;
    this.priceStore = priceStore;
  }

  getPrice(tokenAddress: string) {
    if (!this.priceStore) {
      console.error('!PriceStore undefined');

      return 0;
    }
    return this.priceStore.find(
      (entry) => `${entry.address}`.toLowerCase() === `${tokenAddress}`.toLowerCase(),
    )?.price;
  }

  abstract getApy();

  abstract getTvl();

  abstract getFarm();
}
