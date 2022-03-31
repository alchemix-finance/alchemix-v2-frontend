<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import { deposit, depositUnderlying, multicallDeposit } from '@stores/v2/vaultActions';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import { VaultTypes } from '@stores/v2/types';
  import { addressStore, balancesStore, vaultsStore, adaptersStore } from 'src/stores/v2/alcxStore';
  import { signer } from 'src/stores/v2/derived';
  import {
    fetchBalanceByAddress,
    fetchUpdateVaultByAddress,
    fetchAdaptersForVaultType,
  } from 'src/stores/v2/asyncMethods';
  import MaxLossController from '@components/composed/MaxLossController';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { modalReset } from '@stores/modal';
  import ToggleSwitch from '@components/elements/ToggleSwitch';
  import settings from '@stores/settings';
  import { VaultTypesInfos } from '@stores/v2/constants';

  export let borrowLimit;

  export let vault;

  let maximumLoss;

  let yieldDeposit = 0;
  let underlyingDeposit = 0;
  let depositEth = false;

  const onButtonDeposit = async (_yieldDeposit, _underlyingDeposit) => {
    modalReset();

    await fetchAdaptersForVaultType(VaultTypes[VaultTypes[vault.type]], [$signer]);

    const adapterPrice = $adaptersStore[vault.type].adapters.filter(
      (adapter) =>
        adapter.contractSelector.split('_')[1].toLowerCase() === underlyingTokenData.symbol.toLowerCase(),
    )[0].price;
    const yieldTokens = underlyingDepositBN
      .mul(BigNumber.from(10).pow(underlyingTokenData.decimals))
      .div(adapterPrice);
    const subTokens = yieldTokens.mul(BigNumber.from(maximumLoss)).div(100000);
    const underlyingMinimumIn = yieldTokens.sub(subTokens);

    if (_yieldDeposit.gt(0) && _underlyingDeposit.gt(0)) {
      await multicallDeposit(
        vault.type,
        vault.address,
        vault.underlyingAddress,
        _underlyingDeposit,
        _yieldDeposit,
        BigNumber.from(maximumLoss),
        [$addressStore, $signer],
        underlyingMinimumIn,
      )
        .then(() => {
          Promise.all([
            fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
            fetchBalanceByAddress(vault.address, [$signer]),
            fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore]),
          ]).then(() => {
            console.log('[multicallDeposit/finished]: Balances and vault data updated!');
          });
        })
        .catch((e) => {
          console.error(e);
        });
    } else if (_yieldDeposit.gt(0) && _underlyingDeposit.lte(0)) {
      await deposit(vault.address, vault.type, _yieldDeposit, [$addressStore, $signer])
        .then(() => {
          Promise.all([
            fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
            fetchBalanceByAddress(vault.address, [$signer]),
            fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore]),
          ]).then(() => {
            console.log('[deposit/finished]: Balances and vault data updated!');
          });
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      await depositUnderlying(
        vault.underlyingAddress,
        vault.address,
        vault.type,
        _underlyingDeposit,
        BigNumber.from(maximumLoss),
        [$addressStore, $signer],
        underlyingMinimumIn,
        depositEth,
      )
        .then(() => {
          Promise.all([
            fetchBalanceByAddress(vault.underlyingAddress, [$signer]),
            fetchBalanceByAddress(vault.address, [$signer]),
            fetchUpdateVaultByAddress(vault.type, vault.address, [$signer, $addressStore]),
          ]).then(() => {
            console.log('[depositUnderlying/finished]: Balances and vault data updated!');
          });
        })
        .catch((e) => {
          console.error(`[onButtonDeposit/depositUnderlying]`, e);
        });
    }
  };

  function initializeTokenDataForAddress(address) {
    if (vault) {
      return getTokenDataFromBalances(address, [$balancesStore]);
    }
  }

  $: yieldTokenData = initializeTokenDataForAddress(vault.address);
  $: ethData = getTokenDataFromBalances('0xETH', [$balancesStore]);
  $: underlyingTokenData = initializeTokenDataForAddress(vault.underlyingAddress);
  $: useGateway = vault.useGateway;
  $: console.log(vault);

  function formatDepositToBN(_deposit, _tokenData) {
    if (_deposit && _tokenData) {
      return utils.parseUnits(`${_deposit}`, _tokenData.decimals);
    }

    return BigNumber.from(0);
  }

  $: yieldDepositBN = formatDepositToBN(yieldDeposit, yieldTokenData);
  $: underlyingDepositBN = formatDepositToBN(underlyingDeposit, depositEth ? ethData : underlyingTokenData);

  function initializeStartDebtLimit(borrowLimit, vault, _underlyingTokenData) {
    if (borrowLimit !== undefined && vault) {
      const _correctBorrowLimit = borrowLimit
        .mul(vault.underlyingPerShare)
        .div(BigNumber.from(10).pow(BigNumber.from(_underlyingTokenData.decimals).mul(2)));

      const _fcorrectBorrowLimit = parseFloat(_correctBorrowLimit.toString());

      return _fcorrectBorrowLimit;
    }

    return 0;
  }

  function calculateProjectedDebtLimit(
    _borrowLimit,
    _yieldDeposit,
    _underlyingDeposit,
    _yieldTokenData,
    _underlyingTokenData,
  ) {
    if (!_yieldTokenData || !_underlyingTokenData || !_borrowLimit || !_yieldDeposit || !_underlyingDeposit) {
      return undefined;
    }

    const _tokenDecimals = _underlyingTokenData.decimals + _yieldDeposit.gt(0) ? _yieldTokenData.decimals : 0;
    const total = _underlyingDeposit.add(_yieldDeposit).div(BigNumber.from(10).pow(_tokenDecimals));
    if (total.gt(0)) {
      const _correctBorrowLimit = _borrowLimit
        .mul(vault.underlyingPerShare)
        .div(BigNumber.from(10).pow(BigNumber.from(_underlyingTokenData.decimals).mul(2)));

      const _correctLoanRatio = $vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18));

      const _fTotal = parseFloat(total.toString());
      const _fcorrectBorrowLimit = parseFloat(_correctBorrowLimit.toString());
      const _fCorrectLoanRatio = parseFloat(_correctLoanRatio.toString());

      return _fcorrectBorrowLimit + _fTotal / _fCorrectLoanRatio;
    } else {
      return undefined;
    }
  }

  function calculateTotalDeposit(_vault, _yieldDeposit, _underlyingDeposit, _underlyingTokenData) {
    return utils.formatUnits(
      vault.balance.add(_yieldDeposit.add(_underlyingDeposit)),
      _underlyingTokenData.decimals,
    );
  }

  function switchDepositType() {
    depositEth = !depositEth;
    underlyingDeposit = '';
    yieldDeposit = '';
  }

  $: startDebtLimit = initializeStartDebtLimit(borrowLimit, vault, underlyingTokenData);
  $: projDeptLimit = calculateProjectedDebtLimit(
    borrowLimit,
    yieldDepositBN,
    underlyingDepositBN,
    yieldTokenData,
    underlyingTokenData,
  );

  $: totalDep = calculateTotalDeposit(vault, yieldDepositBN, underlyingDepositBN, underlyingTokenData);

  $: depositButtonDisabled =
    maximumLoss / 1000 >= 100 ||
    !yieldDepositBN.add(underlyingDepositBN).gt(0) ||
    yieldDepositBN.gt(yieldTokenData.balance) ||
    underlyingDepositBN.gt(depositEth ? ethData.balance : underlyingTokenData.balance);
  $: metaConfig = VaultTypesInfos[vault.type].metaConfig[yieldTokenData.address] || false;
  $: acceptGateway = metaConfig.acceptGateway;
</script>

{#if vault}
  <ContainerWithHeader>
    <div slot="header" class="p-4 text-sm flex justify-between">
      <p class="inline-block">{$_('modals.deposit_collateral')}</p>
      <p class="inline-block">
        {$_('modals.loan_ratio')}: {100 / parseFloat(utils.formatEther($vaultsStore[vault.type].ratio))}%
      </p>
    </div>
    <div slot="body" class="p-4">
      {#if metaConfig ? acceptGateway : useGateway}
        <div class="text-sm text-lightgrey10 w-full flex flex-row justify-between mb-3">
          <span>Deposit Type:</span>
          <ToggleSwitch label="WETH" secondLabel="ETH" on:toggleChange="{() => switchDepositType()}" />
        </div>
      {/if}
      <div class="flex space-x-4">
        {#if yieldTokenData.balance.gt(BigNumber.from(0)) && !depositEth}
          <div class="w-full">
            <label for="yieldInput" class="text-sm text-lightgrey10">
              {$_('available')}: {utils.formatUnits(yieldTokenData.balance, yieldTokenData.decimals)}
              {yieldTokenData.symbol}
            </label>
            <div
              class="flex {$settings.invertColors
                ? 'bg-grey3inverse'
                : 'bg-grey3'} rounded border {yieldDepositBN.gt(yieldTokenData.balance)
                ? 'border-red3'
                : `${$settings.invertColors ? 'border-grey3inverse' : 'border-grey3'}`}"
            >
              <div class="w-full">
                <InputNumber
                  id="yieldInput"
                  bind:value="{yieldDeposit}"
                  placeholder="~0.00 {yieldTokenData.symbol}"
                  class="w-full rounded appearance-none text-xl text-right h-full p-4 {$settings.invertColors
                    ? 'bg-grey3inverse'
                    : 'bg-grey3'} {yieldDepositBN.gt(yieldTokenData.balance)
                    ? 'text-red3'
                    : $settings.invertColors
                    ? 'text-lightgrey5inverse'
                    : 'text-lightgrey5'}"
                />
              </div>
              <div class="flex flex-col">
                <Button
                  label="MAX"
                  width="w-full"
                  fontSize="text-xs"
                  textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                  backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => {
                    yieldDeposit = utils.formatUnits(yieldTokenData.balance, yieldTokenData.decimals);
                  }}"
                />
                <Button
                  label="CLEAR"
                  width="w-max"
                  fontSize="text-xs"
                  textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                  backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => {
                    yieldDeposit = '';
                  }}"
                />
              </div>
            </div>
          </div>
        {/if}
        {#if depositEth ? ethData.balance.gt(BigNumber.from(0)) : underlyingTokenData.balance.gt(BigNumber.from(0))}
          <div class="w-full">
            <label for="underlyingInput" class="text-sm text-lightgrey10">
              {$_('available')}: {depositEth
                ? utils.formatEther(ethData.balance)
                : utils.formatUnits(underlyingTokenData.balance, underlyingTokenData.decimals)}
              {depositEth ? ethData.symbol : underlyingTokenData.symbol}
            </label>
            <div
              class="flex {$settings.invertColors
                ? 'bg-grey3inverse'
                : 'bg-grey3'} rounded border {underlyingDepositBN.gt(
                depositEth ? ethData.balance : underlyingTokenData.balance,
              )
                ? 'border-red3'
                : $settings.invertColors
                ? 'border-grey3inverse'
                : 'border-grey3'}"
            >
              <div class="w-full">
                <InputNumber
                  id="underlyingInput"
                  bind:value="{underlyingDeposit}"
                  placeholder="~0.00 {depositEth ? ethData.symbol : underlyingTokenData.symbol}"
                  class="w-full rounded appearance-none text-xl text-right h-full p-4 {$settings.invertColors
                    ? 'bg-grey3inverse'
                    : 'bg-grey3'} {underlyingDepositBN.gt(
                    depositEth ? ethData.balance : underlyingTokenData.balance,
                  )
                    ? 'text-red3'
                    : $settings.invertColors
                    ? 'text-lightgrey5inverse'
                    : 'text-lightgrey5'}"
                />
              </div>
              <div class="flex flex-col">
                <Button
                  label="MAX"
                  width="w-full"
                  fontSize="text-xs"
                  textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                  backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => {
                    underlyingDeposit = depositEth
                      ? utils.formatEther(ethData.balance)
                      : utils.formatUnits(underlyingTokenData.balance, underlyingTokenData.decimals);
                  }}"
                />
                <Button
                  label="CLEAR"
                  width="w-max"
                  fontSize="text-xs"
                  textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                  backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => {
                    underlyingDeposit = '';
                  }}"
                />
              </div>
            </div>
          </div>
        {:else}
          <div class="w-full">
            <p class="text-center mx-3 text-red3 opacity-75">No balance available to deposit.</p>
          </div>
        {/if}
      </div>

      <div class="my-4">
        <MaxLossController bind:maxLoss="{maximumLoss}" />
      </div>

      <div class="my-4 text-sm text-lightgrey10 hidden">
        {$_('modals.deposit_balance')}: {utils.formatUnits(vault.balance, yieldTokenData.decimals)}
        -> {totalDep}<br />
        {$_('modals.borrow_limit')}: {startDebtLimit} ->
        {projDeptLimit || startDebtLimit} <br />
      </div>

      <Button
        label="{$_('actions.deposit')}"
        borderColor="green4"
        backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
        hoverColor="green4"
        height="h-12"
        borderSize="1"
        fontSize="text-md"
        on:clicked="{() => onButtonDeposit(yieldDepositBN, underlyingDepositBN)}"
        disabled="{depositButtonDisabled}"
      />
    </div>
  </ContainerWithHeader>
{/if}
