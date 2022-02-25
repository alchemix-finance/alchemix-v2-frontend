<script>
  import getContract from '../../../../helpers/getContract';
  import Button from '../../../elements/Button.svelte';
  import getUserGas from '../../../../helpers/getUserGas';
  import { getProvider } from '../../../../helpers/walletManager';
  import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '../../../../helpers/setToast';
  import { contractWrapper, externalContractWrapper } from '@helpers/contractWrapper';
  import { signer } from '@stores/v2/derived';
  import {
    castToCrvFarmType,
    castToInternalFarmType,
    castToSushiFarmType,
    FarmTypes,
  } from '@stores/v2/types';
  import { utils } from 'ethers';
  import { addressStore } from '@stores/v2/alcxStore';

  export let farmType;
  export let farm;

  const exitPool = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

    try {
      setPendingWallet();
      let tx;

      if (farmType === FarmTypes.INTERNAL) {
        const castedFarm = castToInternalFarmType(farm);

        const { instance } = contractWrapper('StakingPools', $signer);

        tx = await instance.exit(castedFarm.poolId, {
          gasPrice: gas,
        });
      } else if (farmType === FarmTypes.SUSHI) {
        const castedFarm = castToSushiFarmType(farm);

        const { instance } = contractWrapper('SushiMasterchefV2', $signer);

        tx = await instance.emergencyWithdraw(0, $addressStore, {
          gasPrice: gas,
        });
      } else if (farmType === FarmTypes.CRV) {
        const castedFarm = castToCrvFarmType(farm);

        const { instance: crvGaugeInstance, address: crvGaugeAddress } = externalContractWrapper(
          'CurveGaugeDeposit',
          $signer,
        );

        tx = await crvGaugeInstance.withdraw(castedFarm.userDeposit, {
          gasPrice: gas,
        });
      }

      setPendingTx();

      await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (e) {
      setError(e.message);
      console.debug(e);
    }
  };
</script>

<Button
  borderColor="red4"
  backgroundColor="red2"
  hoverColor="red3"
  label="Exit"
  solid="{false}"
  on:clicked="{() => exitPool()}"
/>
