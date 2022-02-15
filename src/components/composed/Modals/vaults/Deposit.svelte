<script>
  import { onMount } from 'svelte';
  import { utils, BigNumber } from 'ethers';
  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import tempTx from '../../../../stores/tempTx';
  import walletBalance from '../../../../stores/walletBalance';
  import { deposit, depositUnderlying, multicallDeposit } from '@stores/v2/vaultActions';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import { addressStore, balancesStore, vaultsStore } from 'src/stores/v2/alcxStore';
  import { signer } from 'src/stores/v2/derived';
  import { fetchBalanceByAddress, fetchUpdateVaultByAddress } from 'src/stores/v2/asyncMethods';
  import MaxLossController from '@components/composed/MaxLossController';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { formatUnits } from 'ethers/lib/utils';

  export let vaultIndex;

  export let yieldToken;
  export let underlyingToken;
  export let loanRatio;
  export let userDeposit;
  export let borrowLimit;
  export let underlyingDecimals;
  export let yieldDecimals;

  export let vault;

  let maximumLoss;

  let yieldBalance;
  let underlyingBalance;

  let yieldDeposit = 0;
  let underlyingDeposit = 0;
  let totalDeposit;

  let startingDebtLimit;
  let projectedDebtLimit;

  let depositDisabled = true;

  const onButtonDeposit = async () => {
    let yieldAmnt;
    let udrlyAmnt;
    if (yieldDeposit) {
      yieldAmnt = utils.parseUnits(yieldDeposit.toString(), yieldDecimals);
    }
    if (underlyingDeposit) {
      udrlyAmnt = utils.parseUnits(underlyingDeposit.toString(), underlyingDecimals);
    }
    if (yieldAmnt && udrlyAmnt) {
      await multicallDeposit(
        vault.type,
        vault.address,
        vault.underlyingAddress,
        udrlyAmnt,
        yieldAmnt,
        BigNumber.from(maximumLoss),
        [$addressStore, $signer],
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
    } else if (yieldAmnt && !udrlyAmnt) {
      await deposit(vault.address, vault.type, yieldAmnt, [$addressStore, $signer])
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
        udrlyAmnt,
        BigNumber.from(maximumLoss),
        [$addressStore, $signer],
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

  const updateBalances = () => {
    const yieldDepositToWei = utils.parseUnits((yieldDeposit || 0).toString(), yieldDecimals);
    const underlyingDepositToWei = utils.parseUnits((underlyingDeposit || 0).toString(), underlyingDecimals);
    const totalToWei = yieldDepositToWei.add(underlyingDepositToWei);
    totalDeposit = utils.formatUnits(userDeposit.add(totalToWei), underlyingDecimals);
    if (totalToWei.gt(BigNumber.from(0))) {
      projectedDebtLimit = utils.formatUnits(
        BigNumber.from(borrowLimit).add(
          totalToWei.div(BigNumber.from(parseFloat(utils.formatUnits(loanRatio, 18)))),
        ),
        underlyingDecimals,
      );
    } else {
      projectedDebtLimit = startingDebtLimit;
    }
    depositDisabled =
      totalToWei.toString() === '0' || yieldDeposit > yieldBalance || underlyingDeposit > underlyingBalance;
  };

  $: yieldDeposit, updateBalances();
  $: underlyingDeposit, updateBalances();

  function initializeYieldTokenData(vault) {
    if (vault) {
      return getTokenDataFromBalances(vault.address, [$balancesStore]);
    }
  }

  function initializeUnderlyingTokenData(vault) {
    if (vault) {
      return getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);
    }
  }

  $: yieldTokenData = initializeYieldTokenData(vault);
  $: underlyingTokenData = initializeUnderlyingTokenData(vault);

  function formatDepositToBN(_deposit, _tokenData) {
    if (_deposit && _tokenData) {
      return utils.parseUnits(`${_deposit}`, _tokenData.deciamls);
    }

    return BigNumber.from(0);
  }

  $: yieldDepositBN = formatDepositToBN(yieldDeposit, yieldTokenData);
  $: underlyingDepositBN = formatDepositToBN(underlyingDeposit, underlyingTokenData);

  function initializeStartDebtLimit(borrowLimit, vault) {
    if (borrowLimit !== undefined && vault) {
      return BigNumber.from(borrowLimit).div($vaultsStore[vault.type].ratio);
    }

    return BigNumber.from(0);
  }

  // borrowLimit + (totalDeposit / loanRatio)
  // TODO: Fix this
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

    const formatedYield = utils.formatUnits(_yieldDeposit, _yieldTokenData.decimals);
    const formatedUnderlying = utils.formatUnits(_underlyingDeposit, _underlyingTokenData.decimals);

    const total = parseFloat(formatedYield) + parseFloat(formatedUnderlying);

    const formatedBorrowLimit = parseFloat(utils.formatUnits(_borrowLimit, _underlyingTokenData.decimals));

    const formatedRatio = parseFloat(utils.formatUnits($vaultsStore[vault.type].ratio, 18));

    // _borrowLimit
    //    .add(total.div($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18))))
    //  .div(BigNumber.from(10).pow(decimals))
    if (total > 0) {
      const eBorrow = _borrowLimit.div(BigNumber.from(10).pow(_underlyingTokenData.decimals));

      console.log(eBorrow.toString());

      // const t = BigNumber.from(_borrowLimit)
      //   .add(_yieldDeposit.add(_underlyingDeposit))
      //   .div($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)));

      // const decimals =
      //   _underlyingTokenData.decimals + _yieldTokenData.decimals + _underlyingTokenData.decimals;

      // console.log(utils.formatUnits(t, decimals));
      return BigNumber.from(0);
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

  $: startDebtLimit = initializeStartDebtLimit(borrowLimit, vault);
  $: projDeptLimit = calculateProjectedDebtLimit(
    borrowLimit,
    yieldDepositBN,
    underlyingDepositBN,
    yieldTokenData,
    underlyingTokenData,
  );

  $: totalDep = calculateTotalDeposit(vault, yieldDepositBN, underlyingDepositBN, underlyingTokenData);

  onMount(() => {
    startingDebtLimit = utils.formatUnits(
      BigNumber.from(borrowLimit).div(BigNumber.from(parseFloat(utils.formatUnits(loanRatio, 18)))),
      underlyingDecimals,
    );
  });
</script>

{#if vault}
  <ContainerWithHeader>
    <div slot="header" class="p-4 text-sm flex justify-between">
      <p class="inline-block">Deposit Collateral</p>
      <p class="inline-block">Loan Ratio: {100 / parseFloat(utils.formatEther(loanRatio))}%</p>
    </div>
    <div slot="body" class="p-4">
      <div class="flex space-x-4">
        {#if yieldTokenData.balance.gt(BigNumber.from(0))}
          <div class="w-full">
            <label for="yieldInput" class="text-sm text-lightgrey10">
              Available: {utils.formatUnits(yieldTokenData.balance, yieldTokenData.deciamls)}
              {yieldTokenData.symbol}
            </label>
            <div
              class="flex bg-grey3 rounded border {yieldDepositBN.gt(yieldTokenData.balance)
                ? 'border-red3'
                : 'border-grey3'}"
            >
              <div class="w-full">
                <InputNumber
                  id="yieldInput"
                  bind:value="{yieldDeposit}"
                  placeholder="~0.00 {yieldTokenData.symbol}"
                  class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {yieldDepositBN.gt(
                    yieldTokenData.balance,
                  )
                    ? 'text-red3'
                    : 'text-lightgrey5'}"
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
                  on:clicked="{() => {
                    yieldDeposit = utils.formatUnits(yieldTokenData.balance, yieldTokenData.decimals);
                  }}"
                />
                <Button
                  label="CLEAR"
                  width="w-max"
                  fontSize="text-xs"
                  textColor="lightgrey10"
                  backgroundColor="grey3"
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
        {#if underlyingTokenData.balance.gt(BigNumber.from(0))}
          <div class="w-full">
            <label for="underlyingInput" class="text-sm text-lightgrey10">
              Available: {utils.formatUnits(underlyingTokenData.balance, underlyingTokenData.deciamls)}
              {underlyingTokenData.symbol}
            </label>
            <div
              class="flex bg-grey3 rounded border {underlyingDepositBN.gt(underlyingTokenData.balance)
                ? 'border-red3'
                : 'border-grey3'}"
            >
              <div class="w-full">
                <InputNumber
                  id="underlyingInput"
                  bind:value="{underlyingDeposit}"
                  placeholder="~0.00 {underlyingTokenData.symbol}"
                  class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {underlyingDepositBN.gt(
                    underlyingTokenData.balance,
                  )
                    ? 'text-red3'
                    : 'text-lightgrey5'}"
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
                  on:clicked="{() => {
                    underlyingDeposit = utils.formatUnits(
                      underlyingTokenData.balance,
                      underlyingTokenData.decimals,
                    );
                  }}"
                />
                <Button
                  label="CLEAR"
                  width="w-max"
                  fontSize="text-xs"
                  textColor="lightgrey10"
                  backgroundColor="grey3"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => {
                    underlyingDeposit = '';
                  }}"
                />
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div class="my-4 text-sm text-lightgrey10">
        Deposit Balance: {utils.formatUnits(vault.balance, yieldTokenData.decimals)}
        -> {totalDep}<br />
        Borrow Limit: {utils.formatUnits(startDebtLimit, 18)} -> {projectedDebtLimit}

        {projDeptLimit}
      </div>

      <div class="my-4">
        <MaxLossController bind:maxLoss="{maximumLoss}" />
      </div>

      <Button
        label="Deposit"
        borderColor="green4"
        backgroundColor="black1"
        hoverColor="green4"
        height="h-12"
        borderSize="1"
        fontSize="text-md"
        on:clicked="{onButtonDeposit}"
        disabled="{depositDisabled}"
      />
    </div>
  </ContainerWithHeader>
{/if}
