import { VaultTypes } from '@helpers/constants';

export type VaultsStructure = {
  [key in VaultTypes]: {
    debt: any;
    ratio:
  };
};
