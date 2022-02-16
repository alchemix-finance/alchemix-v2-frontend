<script>
  import { _ } from 'svelte-i18n';
  import { utils, FixedNumber, BigNumber } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import { VaultTypesInfos } from '@stores/v2/constants';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import { addressStore, balancesStore, tokensStore, vaultsStore } from 'src/stores/v2/alcxStore';
  import { getTokenDataFromBalances } from 'src/stores/v2/helpers';
  import { burn, repay } from 'src/stores/v2/vaultActions';
  import { signer } from 'src/stores/v2/derived';
  import { fetchBalanceByAddress, fetchVaultDebt, fetchVaultRatio } from 'src/stores/v2/asyncMethods';
  import { modalReset } from '@stores/modal';

  export let selectedVaults;

  let repayAmount;
  let canRepay = false;

  let currentSelectedVault = selectedVaults[0];
  let currentUnderlyingToken = 0;

  const setMaxRepay = (_fAmount, _fDebt) => {
    repayAmount =
      parseFloat(_fAmount) > parseFloat(_fDebt)
        ? `${parseFloat(_fDebt).toFixed(6)}`
        : `${parseFloat(_fAmount).toFixed(6)}`;
  };

  const clearRepay = () => {
    repayAmount = '';
  };

  const onRepayButton = async (debTokenData, amount, vaultType) => {
    modalReset();
    if (VaultTypesInfos[vaultType].name === debTokenData.symbol) {
      await burn(debTokenData.address, amount, vaultType, [$signer, $addressStore]).then(() => {
        Promise.all([
          fetchBalanceByAddress(debTokenData.address, [$signer]),
          fetchVaultDebt(vaultType, [$addressStore, $signer]),
          fetchVaultRatio(vaultType, [$signer]),
        ]).then(() => console.log('[onRepayButton/burn]: Finished data update!'));
      });
    } else {
      await repay(debTokenData.address, amount, vaultType, [$signer, $addressStore]).then(() => {
        Promise.all([
          fetchBalanceByAddress(debTokenData.address, [$signer]),
          fetchVaultDebt(vaultType, [$addressStore, $signer]),
          fetchVaultRatio(vaultType, [$signer]),
        ]).then(() => console.log('[onRepayButton/repay]: Finished data update!'));
      });
    }
  };

  function generateTokenListBasedOnVaultId(_vaultId, _vaultsStore) {
    if (!_vaultsStore[_vaultId] || _vaultId === undefined) {
      return [];
    }

    const _vyTokens = [];

    const debtTokenData = getTokenDataFromBalances(_vaultsStore[_vaultId].debtToken, [$balancesStore]);

    console.log($balancesStore);
    console.log(_vaultsStore[_vaultId].debtToken);

    _vyTokens.push({
      address: debtTokenData.address,
      symbol: debtTokenData.symbol,
    });

    _vaultsStore[_vaultId].vaultBody.forEach((vault) => {
      const _tokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);

      _vyTokens.push({
        address: _tokenData.address,
        symbol: _tokenData.symbol,
      });
    });

    return _vyTokens;
  }

  const calculateRemainingDebt = (_fDebt, _fInputNumber) => {
    return parseFloat(_fInputNumber) >= parseFloat(_fDebt)
      ? 0
      : parseFloat(_fDebt) - parseFloat(_fInputNumber);
  };

  $: underlyingTokenList = generateTokenListBasedOnVaultId(currentSelectedVault, $vaultsStore);

  $: currentTokenData = getTokenDataFromBalances(underlyingTokenList[currentUnderlyingToken].address, [
    $balancesStore,
  ]);

  $: ({ debt } = $vaultsStore[currentSelectedVault].debt);

  $: currentUnderlyingToken, clearRepay();

  $: lastDebt = calculateRemainingDebt(utils.formatEther(debt), repayAmount || 0);

  $: canRepay =
    parseFloat(repayAmount) > 0 &&
    parseFloat(repayAmount) <= parseFloat(utils.formatEther(debt)) &&
    parseFloat(repayAmount) <=
      parseFloat(utils.formatUnits(currentTokenData.balance, currentTokenData.decimals));
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex items-center justify-between">
    <p class="inline-block">{$_('modals.repay_loans')}</p>
    <div class="flex gap-1">
      {#if selectedVaults.length > 1}
        <select
          name="selectToken"
          id="selectToken"
          class="cursor-pointer border border-grey5 bg-grey1 h-8 rounded p-1 text-xs block w-24"
          bind:value="{currentSelectedVault}"
        >
          {#each selectedVaults as vaultId}
            <option value="{vaultId}">{VaultTypesInfos[vaultId].name}</option>
          {/each}
        </select>
      {/if}
      <select
        id="selectUnderlying"
        class="cursor-pointer border border-grey5 bg-grey1 h-8 rounded p-1 text-xs block w-24"
        bind:value="{currentUnderlyingToken}"
      >
        {#each underlyingTokenList as token, index}
          <option value="{index}">{token.symbol}</option>
        {:else}
          <option>...</option>
        {/each}
      </select>
    </div>
  </div>
  <div slot="body" class="p-4 flex flex-col space-y-4">
    <label for="repayInput" class="text-sm text-lightgrey10">
      {$_('available')}: {utils.formatUnits(currentTokenData.balance, currentTokenData.decimals)}
      {currentTokenData.symbol}
    </label>

    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="repayInput"
          placeholder="~0.00 {currentTokenData.symbol}"
          bind:value="{repayAmount}"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3"
        />
      </div>
      <div class="flex flex-col">
        <Button
          label="MAX"
          width="w-full"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() =>
            setMaxRepay(
              utils.formatUnits(currentTokenData.balance, currentTokenData.decimals),
              utils.formatEther(debt),
            )}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => clearRepay()}"
        />
      </div>
    </div>
    <div class="w-full text-sm text-lightgrey10">
      {$_('modals.outstanding_debt')}: {utils.formatEther(debt)} -> {lastDebt.toFixed(10)}
    </div>
    <Button
      label="{$_('actions.repay')}"
      borderColor="green4"
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!canRepay}"
      on:clicked="{() =>
        onRepayButton(
          currentTokenData,
          utils.parseUnits(`${repayAmount}` || `0`, currentTokenData.decimals || 1),
          currentSelectedVault,
        )}"
    />
  </div>
</ContainerWithHeader>
