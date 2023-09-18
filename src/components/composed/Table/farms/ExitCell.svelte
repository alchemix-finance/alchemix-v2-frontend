<script>
  import Button from '../../../elements/Button.svelte';
  import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '@helpers/setToast';
  import { contractWrapper, externalContractWrapper } from '@helpers/contractWrapper';
  import { signer } from '@stores/v2/derived';
  import {
    castToCrvFarmType,
    castToInternalFarmType,
    castToSushiFarmType,
    FarmTypes,
  } from '@stores/v2/types';
  import { BigNumber, utils } from 'ethers';
  import { addressStore } from '@stores/v2/alcxStore';
  import { fetchCrvFarmByUuid, fetchInternalFarmByUuid, fetchSushiFarmByUuid } from '@stores/v2/asyncMethods';
  import settings from '@stores/settings';

  export let farmType;
  export let farm;

  const exitPool = async () => {
    try {
      if (farmType === FarmTypes.INTERNAL) {
        const castedFarm = castToInternalFarmType(farm);

        const { instance } = await contractWrapper('StakingPools', $signer, 'ethereum');
        setPendingWallet();
        const tx = await instance.exit(castedFarm.poolId);
        setPendingTx();
        await tx.wait().then((transaction) => {
          setSuccessTx(transaction.hash);
          fetchInternalFarmByUuid(castedFarm.uuid, castedFarm.poolId, [$signer]);
        });
      } else if (farmType === FarmTypes.SUSHI) {
        const castedFarm = castToSushiFarmType(farm);

        const { instance } = await externalContractWrapper('SushiMasterchefV2', $signer);
        setPendingWallet();
        const tx = await instance.emergencyWithdraw(0, $addressStore);
        setPendingTx();
        await tx.wait().then((transaction) => {
          setSuccessTx(transaction.hash);
          fetchSushiFarmByUuid(castedFarm.uuid, [$signer]);
        });
      } else if (farmType === FarmTypes.CRV) {
        const castedFarm = castToCrvFarmType(farm);

        const { instance: crvGaugeInstance, address: crvGaugeAddress } = await externalContractWrapper(
          'CurveGaugeDeposit',
          $signer,
        );
        setPendingWallet();
        const tx = await crvGaugeInstance['withdraw(uint256)'](castedFarm.userDeposit);
        setPendingTx();
        await tx.wait().then((transaction) => {
          setSuccessTx(transaction.hash);
          fetchCrvFarmByUuid(castedFarm.uuid, [$signer]);
        });
      }
    } catch (e) {
      setError(e.message, e);
      console.error(e);
    }
  };

  const checkButtonState = (farm) => {
    if (Array.isArray(farm.userDeposit)) {
      return (
        farm.userDeposit.some((elm) => elm.gt(BigNumber.from(0))) ||
        farm.userUnclaimed.some((elm) => elm.gt(BigNumber.from(0)))
      );
    }

    return (
      BigNumber.from(farm.userDeposit).gt(BigNumber.from(0)) ||
      farm.userUnclaimed.some((elm) => elm.gt(BigNumber.from(0)))
    );
  };
</script>

{#if farm}
  <Button
    borderColor="red4"
    backgroundColor="{$settings.invertColors ? 'red5' : 'red2'}"
    hoverColor="red3"
    label="Exit"
    solid="{false}"
    disabled="{!checkButtonState(farm)}"
    on:clicked="{() => exitPool()}"
  />
{/if}
