<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';

  import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
  import Button from '../../../elements/Button.svelte';
  import DebtCard from '@components/elements/DebtCard.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';

  import { VaultTypesInfos } from '@stores/v2/constants';
  import { addressStore, balancesStore, vaultsStore, networkStore } from '@stores/v2/alcxStore';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { burn, repay } from '@stores/v2/vaultActions';
  import { signer } from '@stores/v2/derived';
  import { fetchBalanceByAddress, fetchVaultDebt, fetchVaultRatio } from '@stores/v2/asyncMethods';
  import settings from '@stores/settings';

  export let selectedVaultsType;

  let inputRepayAmount = 0;

  let currentSelectedVaultType = selectedVaultsType[0];
  // let currentSelectedUnderlyingToken = 0;

  const useTokenListForVaultType = (vaultType, [vaultsStore]) => {
    if (!vaultsStore || vaultType === undefined) {
      return [];
    }

    const debtTokenData = getTokenDataFromBalances(vaultsStore[vaultType].debtTokenAddress, [$balancesStore]);

    let tokensArr = [
      {
        address: debtTokenData.address,
        balance: debtTokenData.balance,
        listSymbol: debtTokenData.symbol,
        symbol: debtTokenData.symbol,
        decimals: debtTokenData.decimals,
        underlyingPerShare: BigNumber.from(1),
        debtToken: debtTokenData.symbol,
      },
    ];

    for (const vaultBody of vaultsStore[vaultType].vaultBody) {
      const underlyingTokenData = getTokenDataFromBalances(vaultBody.underlyingAddress, [$balancesStore]);

      const underlyingTokenSymbol = (() => {
        if (!VaultTypesInfos[currentSelectedVaultType]?.metaConfig[vaultBody.underlyingAddress]) {
          return underlyingTokenData.symbol;
        }

        return VaultTypesInfos[currentSelectedVaultType].metaConfig[vaultBody.underlyingAddress].token;
      })();

      // @dev since many vaults share the same underlying token, we need to prevent duplicates
      if (!tokensArr.some((entry) => entry.symbol === underlyingTokenSymbol)) {
        tokensArr.push({
          address: vaultBody.underlyingAddress,
          balance: underlyingTokenData.balance,
          listSymbol: underlyingTokenSymbol,
          symbol: underlyingTokenSymbol,
          decimals: underlyingTokenData.decimals,
          underlyingPerShare: vaultBody.underlyingPerShare,
          debtToken: debtTokenData.symbol,
        });
      }
    }

    return tokensArr;
  };

  const useBigNumberForInput = (inputValue) => {
    if (inputValue === 0 || inputValue === '') {
      return BigNumber.from(0);
    }

    return utils.parseEther(`${inputValue}`);
  };

  $: tokensForVaultType = useTokenListForVaultType(currentSelectedVaultType, [$vaultsStore]).filter((entry) =>
    entry.balance.gt(BigNumber.from(0)),
  );

  $: inputRepayAmountBN = useBigNumberForInput(inputRepayAmount);

  $: debtAmount = $vaultsStore[currentSelectedVaultType].debt[0] || BigNumber.from(0);

  const getDebtForVaultType = (vaultType) => {
    if (!$vaultsStore || vaultType === undefined) {
      return '0';
    }

    return utils.formatEther($vaultsStore[vaultType].debt[0]) || '0';
  };

  $: normalizedUnderlyingBalance = utils.parseEther(
    utils.formatUnits(
      tokensForVaultType[currentSelectedUnderlyingToken]?.balance || BigNumber.from(0),
      tokensForVaultType[currentSelectedUnderlyingToken]?.decimals || 18,
    ),
  );

  const onRepayButton = async (repayAmount, underlyingTokenData, debtTokenData, vaultType) => {
    const _fRepayAmount = utils.parseUnits(utils.formatEther(repayAmount), underlyingTokenData.decimals);

    if (underlyingTokenData.symbol === debtTokenData) {
      await burn(
        underlyingTokenData.address,
        _fRepayAmount,
        vaultType,
        [$signer, $addressStore],
        $networkStore,
      ).then(() => {
        Promise.all([
          fetchBalanceByAddress(underlyingTokenData.address, [$signer]),
          fetchVaultDebt(vaultType, [$addressStore, $signer], $networkStore),
          fetchVaultRatio(vaultType, [$signer], $networkStore),
        ]).then(() => {
          console.log('[onRepayButton/burn]: Finished data update!');
        });
      });
    } else {
      await repay(
        underlyingTokenData.address,
        _fRepayAmount,
        vaultType,
        [$signer, $addressStore],
        $networkStore,
      ).then(() => {
        Promise.all([
          fetchBalanceByAddress(underlyingTokenData.address, [$signer]),
          fetchVaultDebt(vaultType, [$addressStore, $signer], $networkStore),
          fetchVaultRatio(vaultType, [$signer], $networkStore),
        ]).then(() => {
          console.log('[onRepayButton/burn]: Finished data update!');
        });
      });
    }
  };

  let currentSelectedUnderlyingTokenSymbol;
  let tokenList;

  $: tokenList = tokensForVaultType
    .filter((entry) => entry.balance.gt(BigNumber.from(0)))
    .map((token) => token.listSymbol);
  $: fullTokenList = useTokenListForVaultType(currentSelectedVaultType, [$vaultsStore]).map(
    (token) => token.listSymbol,
  );
  $: currentSelectedUnderlyingToken =
    tokensForVaultType.findIndex((entry) => entry.symbol === currentSelectedUnderlyingTokenSymbol) || 0;
  $: currentSelectedUnderlyingToken, currentSelectedVaultType, (inputRepayAmount = '');
  $: initialList = tokenList.length === 0 ? fullTokenList : tokenList;

  const updateSelectionData = (value) => {
    currentSelectedVaultType = value.detail.vault;
    currentSelectedUnderlyingTokenSymbol = useTokenListForVaultType(currentSelectedVaultType, [
      $vaultsStore,
    ]).filter((entry) => entry.balance.gt(BigNumber.from(0)))[0].symbol;
  };
</script>

<ContainerWithHeader noBorder="{true}">
  <div slot="body" class="p-4 flex flex-col space-y-4">
    <div class="flex flex-row space-x-4">
      {#each selectedVaultsType as vaultType}
        <DebtCard
          selected="{currentSelectedVaultType === vaultType}"
          debtToken="{VaultTypesInfos[vaultType].name}"
          debtAmount="{getDebtForVaultType(vaultType)}"
          vault="{vaultType}"
          on:selectionUpdate="{(value) => {
            updateSelectionData(value);
          }}"
        />
      {/each}
    </div>
    <ComplexInput
      supportedTokens="{initialList}"
      bind:inputValue="{inputRepayAmount}"
      bind:selectedToken="{currentSelectedUnderlyingTokenSymbol}"
    />

    <Button
      label="{$_('actions.repay')} with {currentSelectedUnderlyingTokenSymbol}"
      borderColor="green4"
      backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!(
        inputRepayAmountBN.gt(BigNumber.from(0)) && inputRepayAmountBN.lte(normalizedUnderlyingBalance)
      )}"
      on:clicked="{() =>
        onRepayButton(
          inputRepayAmountBN,
          tokensForVaultType[currentSelectedUnderlyingToken],
          fullTokenList[0],
          currentSelectedVaultType,
        )}"
    />
  </div>
</ContainerWithHeader>
