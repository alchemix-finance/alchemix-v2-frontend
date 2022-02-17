<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import PageHeader from '../components/elements/PageHeader.svelte';
  import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
  import Button from '../components/elements/Button.svelte';
  import AccountsPageBarCharts from '../components/composed/AccountsPageBarCharts.svelte';
  import { BarLoader } from 'svelte-loading-spinners';
  import account from '@stores/account';
  import { aggregate, alusd } from '../stores/vaults';
  import getContract, { getFragment } from '../helpers/getContract';
  import { getTokenAllowance, getTokenDecimals } from '../helpers/getTokenData';
  import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
  import Table from '../components/composed/Table/Table.svelte';
  import FarmNameCell from '../components/composed/Table/farms/FarmNameCell.svelte';
  import ActionsCell from '../components/composed/Table/vaults/ActionsCell.svelte';
  import Borrow from '../components/composed/Modals/vaults/Borrow.svelte';
  import Repay from '../components/composed/Modals/vaults/Repay.svelte';
  import Liquidate from '../components/composed/Modals/vaults/Liquidate.svelte';
  import tempTx, { defaults } from '../stores/tempTx';
  import { getProvider } from '../helpers/walletManager';
  import getUserGas from '../helpers/getUserGas';
  import { setPendingTx, setPendingWallet, setSuccessTx, setError } from '../helpers/setToast';
  import setTokenAllowance from '../helpers/setTokenAllowance';
  import CurrencyCell from '../components/composed/Table/CurrencyCell.svelte';
  import { updateWalletBalance, updateAlusdVault, updateAlusdAggregate } from '../helpers/updateData';
  import Metrics from '../components/composed/Metrics.svelte';
  import { showModal, modalReset } from '@stores/modal';

  import { balancesStore, vaultsStore, VaultsType } from '@stores/v2/alcxStore';
  import { VaultTypes } from 'src/stores/v2/types';
  import { AllowedVaultTypes, VaultTypesInfos } from 'src/stores/v2/constants';
  import makeSelectorStore from 'src/stores/v2/selectorStore';
  import { calculateVaultDebt, getTokenDataFromBalances } from 'src/stores/v2/helpers';
  import { vaultsLoading } from 'src/stores/v2/loadingStores';

  const vaultsSelector = makeSelectorStore([VaultTypes.alUSD]);

  const showMetrics = true;

  let rowsAll = [];
  let colsStrats = [
    {
      columnId: 'col2',
      CellComponent: HeaderCell,
      value: $_('table.strategy'),
      colSize: 3,
    },
    {
      columnId: 'deposit',
      CellComponent: HeaderCell,
      value: $_('table.deposited'),
      colSize: 2,
    },
    {
      columnId: 'limit',
      CellComponent: HeaderCell,
      value: $_('table.debt_limit'),
      colSize: 2,
    },
    {
      columnId: 'col3',
      CellComponent: HeaderCell,
      value: $_('table.tvl'),
      colSize: 2,
    },
    {
      columnId: 'col4',
      CellComponent: HeaderCell,
      value: $_('table.apy'),
      colSize: 2,
    },
    {
      columnId: 'col5',
      CellComponent: HeaderCell,
      value: $_('table.actions'),
      colSize: 3,
    },
  ];

  let underlyingTokenAlusd = [];
  let yieldTokenAlusd = [];

  // @dev logic for controlling the filtered views

  const tempClear = () => {
    tempTx.set({ ...defaults });
  };

  const contract = getContract('AlchemistV2_alUSD');
  const contractIface = getFragment('AlchemistV2_alUSD');
  const provider = getProvider();
  const abiCoder = utils.defaultAbiCoder;

  const deposit = async () => {
    try {
      const allowance = await getTokenAllowance($tempTx.yieldToken, $account.address, contract.address);
      const decimals = await getTokenDecimals($tempTx.yieldToken);
      const amountToWei = $tempTx.amountYield;
      const token = $tempTx.yieldToken;
      const vaultIndex = $tempTx.vaultIndex;
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
      setPendingWallet();
      if (!allowance) {
        await setTokenAllowance($tempTx.yieldToken, contract.address);
      }
      const tx = await contract.deposit($tempTx.yieldToken, amountToWei, $account.address, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
        refreshData({ token, vaultIndex });
      });
    } catch (e) {
      setError(e.data ? await e.data.message : e.message);
      console.debug(e);
    }
    tempClear();
  };

  const depositUnderlying = async () => {
    const refreshPayload = {
      token: $tempTx.underlyingToken,
      vaultIndex: $tempTx.vaultIndex,
    };
    try {
      const allowanceUnderlying = await getTokenAllowance(
        $tempTx.underlyingToken,
        $account.address,
        contract.address,
      );
      const decimals = await getTokenDecimals($tempTx.underlyingToken);
      const amountToWei = $tempTx.amountUnderlying;
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
      if (!allowanceUnderlying) {
        await setTokenAllowance($tempTx.underlyingToken, contract.address);
      }
      setPendingWallet();
      const maximumLoss = $tempTx.maximumLoss;
      const tx = await contract.depositUnderlying(
        $tempTx.yieldToken,
        amountToWei,
        $account.address,
        maximumLoss,
        {
          gasPrice: gas,
        },
      );
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
        refreshData(refreshPayload);
      });
    } catch (e) {
      setError(e.data ? await e.data.message : e.message);
      console.log(e);
    }
    tempClear();
  };

  const multicall = async () => {
    try {
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
      const allowanceUnderlying = await getTokenAllowance(
        $tempTx.underlyingToken,
        $account.address,
        contract.address,
      );
      const allowanceYield = await getTokenAllowance($tempTx.yieldToken, $account.address, contract.address);
      const decimals = await getTokenDecimals($tempTx.underlyingToken);
      const yieldToWei = $tempTx.amountYield;
      const underlyingToWei = $tempTx.amountUnderlying;
      if (!allowanceUnderlying) await setTokenAllowance($tempTx.underlyingToken, contract.address);
      if (!allowanceYield) await setTokenAllowance($tempTx.yieldToken, contract.address);

      let tx;
      setPendingWallet();
      const deposit = contractIface.encodeFunctionData('deposit', [
        $tempTx.yieldToken,
        yieldToWei,
        $account.address,
      ]);
      const maximumLoss = $tempTx.maximumLoss;
      const depositUnderlying = contractIface.encodeFunctionData('depositUnderlying', [
        $tempTx.yieldToken,
        underlyingToWei,
        $account.address,
        maximumLoss,
      ]);
      const dataPackage = [deposit, depositUnderlying];
      tx = await contract.multicall(dataPackage, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
        refreshData({ token: $tempTx.yieldToken });
        refreshData({ token: $tempTx.underlyingToken, vaultIndex: $tempTx.vaultIndex });
      });
    } catch (e) {
      setError(e.data ? await e.data.message : e.message);
      console.debug(e);
    }
    tempClear();
  };

  const mint = async () => {
    const amount = $tempTx.amountBorrow;
    const target = $tempTx.targetAddress;
    const normalizedAmount = utils.parseEther(amount.toString());
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    try {
      setPendingWallet();
      const tx = await contract.mint(normalizedAmount, target || $account.address, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, async (transaction) => {
        setSuccessTx(transaction.transactionHash);
        await updateAlusdAggregate();
        refreshValueArrays();
        getRandomData();
      });
    } catch (e) {
      setError(e.data ? await e.data.message : e.message);
      console.error(e);
    }
    tempClear();
  };

  const repay = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const underlyingToken = $tempTx.underlyingToken;
    try {
      setPendingWallet();
      const tx = await contract.repay($tempTx.underlyingToken, $tempTx.amountRepay, $account.address, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, async (transaction) => {
        setSuccessTx(transaction.transactionHash);
        await updateWalletBalance(underlyingToken);
        await updateAlusdAggregate();
        refreshValueArrays();
        getRandomData();
      });
    } catch (e) {
      console.error(e);
      setError(e.data ? await e.data.message : e.message);
    }
    tempClear();
  };

  const burn = async () => {
    console.log('burn', $tempTx, $tempTx.amountRepay.toString());
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const debtToken = $tempTx.underlyingToken;
    const burnAmount = $tempTx.amountRepay;
    const allowanceBurn = await getTokenAllowance(
      $tempTx.underlyingToken,
      $account.address,
      contract.address,
    );
    try {
      setPendingWallet();
      if (!allowanceBurn) {
        await setTokenAllowance($tempTx.underlyingToken, contract.address);
      }
      const tx = await contract.burn(burnAmount, $account.address, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, async (transaction) => {
        setSuccessTx(transaction.transactionHash);
        await updateWalletBalance(debtToken);
        await updateAlusdAggregate();
        refreshValueArrays();
        getRandomData();
      });
    } catch (e) {
      console.error(e);
      setError(e.data ? await e.data.message : e.message);
    }
    tempClear();
  };

  const liquidate = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const maximumLoss = $tempTx.maximumLoss;
    try {
      setPendingWallet();
      const tx = await contract.liquidate($tempTx.yieldToken, $tempTx.amountRepay, maximumLoss, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, async (transaction) => {
        setSuccessTx(transaction.transactionHash);
        await updateAlusdAggregate();
        refreshValueArrays();
        getRandomData();
      });
    } catch (e) {
      console.error(e);
      setError(e.data ? await e.data.message : e.message);
    }
    tempClear();
  };

  const withdraw = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const refreshPayload = {
      token: $tempTx.yieldToken,
      vaultIndex: $tempTx.vaultIndex,
    };
    try {
      setPendingWallet();
      const tx = await contract.withdraw(
        $tempTx.yieldToken,
        $tempTx.amountYield,
        $tempTx.targetAddress || $account.address,
        {
          gasPrice: gas,
        },
      );
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
        refreshData(refreshPayload);
      });
    } catch (e) {
      console.error(e);
      setError(e.data ? await e.data.message : e.message);
    }
    tempClear();
  };

  const withdrawUnderlying = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const maximumLoss = $tempTx.maximumLoss;
    const refreshPayload = {
      token: $tempTx.underlyingToken,
      vaultIndex: $tempTx.vaultIndex,
    };
    try {
      setPendingWallet();
      const tx = await contract.withdrawUnderlying(
        $tempTx.yieldToken,
        $tempTx.amountUnderlying,
        $tempTx.targetAddress || $account.address,
        maximumLoss,
        {
          gasPrice: gas,
        },
      );
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
        refreshData(refreshPayload);
      });
    } catch (e) {
      console.error(e);
      setError(e.data ? await e.data.message : e.message);
    }
    tempClear();
  };

  const withdrawMulticall = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const maximumLoss = $tempTx.maximumLoss;
    try {
      const withdrawUnderlyingEncoded = contractIface.encodeFunctionData('withdrawUnderlying', [
        $tempTx.yieldToken,
        $tempTx.amountUnderlying,
        $account.address,
        maximumLoss,
      ]);
      const withdrawYieldEncoded = contractIface.encodeFunctionData('withdraw', [
        $tempTx.yieldToken,
        $tempTx.amountYield,
        $account.address,
      ]);
      const txPackage = [withdrawUnderlyingEncoded, withdrawYieldEncoded];
      setPendingWallet();
      const tx = await contract.multicall(txPackage, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
        refreshData({ token: $tempTx.yieldToken });
        refreshData({ token: $tempTx.underlyingToken, vaultIndex: $tempTx.vaultIndex });
      });
    } catch (e) {
      setError(e.data ? await e.data.message : e.message);
      console.debug(e);
    }
    tempClear();
  };

  const methodLookup = {
    deposit: deposit,
    depositUnderlying: depositUnderlying,
    multicall: multicall,
    withdraw: withdraw,
    withdrawUnderlying: withdrawUnderlying,
    withdrawMulticall: withdrawMulticall,
    mint: mint,
    repay: repay,
    burn: burn,
    liquidate: liquidate,
  };

  $: if ($tempTx.method !== null) {
    closeModal();
    methodLookup[$tempTx.method]();
  }
  /*
   * @dev forces rerendering of table content, which is neccessary due to the prop structure supplied to tables
   * @param payload an object with data to process
   */
  const refreshData = async (payload) => {
    await updateWalletBalance(payload.token).catch((e) =>
      console.error(`[Vaults.svelte/refreshData/updateWalletBalance]: ${e}`),
    );
    await updateAlusdVault(payload.vaultIndex).catch((e) =>
      console.error(`[Vaults.svelte/refreshData/updateAlusdVault]: ${e}`),
    );
    const indexLocal = rowsAll.findIndex((row) => row.col5.vaultIndex === payload.vaultIndex);
    const indexStore = $alusd.rows.findIndex((row) => row.token === rowsAll[indexLocal].col5.yieldToken);
    rowsAll[indexLocal].deposited.value = utils.formatUnits(
      $alusd.rows[indexStore].balance
        .mul($alusd.rows[indexStore].underlyingPerShare)
        .div(BigNumber.from(10).pow($alusd.rows[indexStore].underlyingDecimals)),
      $alusd.rows[indexStore].underlyingDecimals,
    );
    rowsAll[indexLocal].limit.value = $alusd.rows[indexStore].vaultDebt.toString();
    rowsAll[indexLocal].col3.value = utils.formatUnits(
      utils.parseUnits($alusd.rows[indexStore].tvl, $alusd.rows[indexStore].underlyingDecimals).toString(),
      $alusd.rows[indexStore].underlyingDecimals,
    );
    rowsAll[indexLocal].col5.userDeposit = $alusd.rows[indexStore].balance;
    rowsAll[indexLocal].col5.borrowLimit = $alusd.rows[indexStore].vaultDebt;
    console.log($alusd.userDebt, $alusd.userDebt.toString(), $alusd.rows[indexStore].underlyingDecimals);
    rowsAll[indexLocal].col5.openDebtAmount = utils.parseUnits($alusd.userDebt, 18);
    refreshValueArrays();
    getRandomData();
  };

  const TypeOfStrategies = Object.freeze({
    USED: 0,
    UNUSED: 1,
    ALL: 2,
  });

  const strategyFilterFunc = {
    [TypeOfStrategies.USED]: (_vault) => _vault.balance.gt(BigNumber.from(0)),
    [TypeOfStrategies.UNUSED]: (_vault) => _vault.balance.lte(BigNumber.from(0)),
    [TypeOfStrategies.ALL]: (_vault) => true,
  };

  let currentStrategy = TypeOfStrategies.ALL;

  function countStrategiesForTypeOfStrategy(streategyFuncFilter, vaults) {
    return vaults.filter(streategyFuncFilter).length ?? 0;
  }

  $: currentVaultsBasedOnType =
    Object.keys($vaultsStore)
      .map((vTypeId) => {
        if ($vaultsSelector.includes(parseInt(vTypeId))) {
          return $vaultsStore[parseInt(vTypeId)].vaultBody;
        }
      })
      .filter((elm) => elm !== undefined)
      .reduce((accumulator, value) => accumulator.concat(value), []) ?? [];

  $: currentVaultsBasedOnStrategyType =
    currentVaultsBasedOnType.filter(strategyFilterFunc[currentStrategy]) ?? [];

  $: currentRowsOnCurrentStrategyType = currentVaultsBasedOnStrategyType.map((vault, index) => {
    const vaultTokenData = getTokenDataFromBalances(vault.address, [$balancesStore]);
    const underlyingTokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);

    const vaultDebt = calculateVaultDebt(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      $vaultsStore[vault.type].ratio,
    );

    const ratio = $vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18));

    return {
      type: vault.balance.gt(BigNumber.from(0)) ? 'used' : 'unused',
      alchemist: 'alusd',
      row: {
        col2: {
          CellComponent: FarmNameCell,
          farmName: vaultTokenData.symbol,
          farmSubtitle: 'Yearn ' + underlyingTokenData.symbol,
          farmIcon: 'alusd_med.svg',
          tokenIcon: `${underlyingTokenData.symbol}`.toLowerCase(),
          colSize: 3,
          alignment: 'justify-self-start',
        },
        deposited: {
          CellComponent: CurrencyCell,
          // value:
          //   ($alusd.rows[index].balance * $alusd.rows[index].underlyingPerShare) /
          //   10 ** $alusd.rows[index].underlyingDecimals,
          value:
            utils.formatUnits(
              vault.balance
                .mul(vault.underlyingPerShare)
                .div(BigNumber.from(10).pow(underlyingTokenData.decimals)),
              underlyingTokenData.decimals,
            ) ?? 0,
          colSize: 2,
        },
        limit: {
          CellComponent: CurrencyCell,
          value: utils.formatUnits(
            vault.balance
              .mul(vault.underlyingPerShare)
              .div(BigNumber.from(10).pow(underlyingTokenData.decimals))
              .div(ratio),
            underlyingTokenData.decimals,
          ),
          prefix: '+',
          colSize: 2,
        },
        col3: {
          CellComponent: CurrencyCell,
          value: utils.formatUnits(vault.tvl.mul(vault.underlyingPerShare), underlyingTokenData.decimals * 2),
          colSize: 2,
        },
        col4: {
          value: 'N/A',
          colSize: 2,
        },
        col5: {
          CellComponent: ActionsCell,
          colSize: 3,
          vault: vault,
          borrowLimit: vaultDebt,
        },
      },
    };
  });

  // @dev updates the arrays used to feed data to "borrow", "repay" and "liquidate" modals
  const refreshValueArrays = () => {
    underlyingTokenAlusd.length = 0;
    yieldTokenAlusd.length = 0;
    underlyingTokenAlusd.push({
      ...$alusd.debtToken,
      balance: utils.parseUnits($alusd.debtToken.balance, $alusd.debtToken.decimals),
      method: 'burn',
    });
    for (const token of $alusd.yieldTokens) {
      const index = $alusd.rows.findIndex((row) => row.token === token);
      yieldTokenAlusd.push({
        symbol: $alusd.rows[index].yieldSymbol,
        address: token,
        balance: $alusd.rows[index].balance,
        decimals: $alusd.rows[index].yieldDecimals,
        yieldPerShare: $alusd.rows[index].yieldPerShareFormatted,
        underlyingPerShare: $alusd.rows[index].underlyingPerShareFormatted,
      });
      underlyingTokenAlusd.push({
        symbol: $alusd.rows[index].underlyingSymbol,
        address: $alusd.rows[index].underlyingToken,
        balance: $alusd.rows[index].underlyingBalance,
        decimals: $alusd.rows[index].underlyingDecimals,
        method: 'repay',
      });
    }
  };

  const renderVaults = async () => {
    // alUSD Alchemist only atm
    underlyingTokenAlusd.push({
      ...$alusd.debtToken,
      balance: utils.parseUnits($alusd.debtToken.balance, $alusd.debtToken.decimals),
      method: 'burn',
    });
    for (const token of $alusd.yieldTokens) {
      const index = $alusd.rows.findIndex((row) => row.token === token);
      yieldTokenAlusd.push({
        symbol: $alusd.rows[index].yieldSymbol,
        address: token,
        balance: $alusd.rows[index].balance,
        decimals: $alusd.rows[index].yieldDecimals,
        yieldPerShare: $alusd.rows[index].yieldPerShareFormatted,
        underlyingPerShare: $alusd.rows[index].underlyingPerShareFormatted,
      });
      underlyingTokenAlusd.push({
        symbol: $alusd.rows[index].underlyingSymbol,
        address: $alusd.rows[index].underlyingToken,
        balance: $alusd.rows[index].underlyingBalance,
        decimals: $alusd.rows[index].underlyingDecimals,
        method: 'repay',
      });
      const payload = {
        type: $alusd.rows[index].stratIsUsed ? 'used' : 'unused',
        alchemist: 'alusd',
        row: {
          col2: {
            CellComponent: FarmNameCell,
            farmName: $alusd.rows[index].yieldSymbol,
            farmSubtitle: 'Yearn ' + $alusd.rows[index].underlyingSymbol,
            farmIcon: 'alusd_med.svg',
            tokenIcon: $alusd.rows[index].underlyingSymbol.toLowerCase(),
            colSize: 3,
            alignment: 'justify-self-start',
          },
          deposited: {
            CellComponent: CurrencyCell,
            value: utils.formatUnits(
              $alusd.rows[index].balance
                .mul($alusd.rows[index].underlyingPerShare)
                .div(BigNumber.from(10).pow($alusd.rows[index].underlyingDecimals)),
              $alusd.rows[index].underlyingDecimals,
            ),
            colSize: 2,
          },
          limit: {
            CellComponent: CurrencyCell,
            value: $alusd.rows[index].vaultDebt.toString(),
            prefix: '+',
            colSize: 2,
          },
          col3: {
            CellComponent: CurrencyCell,
            value: utils.formatUnits(
              utils.parseUnits($alusd.rows[index].tvl, $alusd.rows[index].underlyingDecimals).toString(),
              $alusd.rows[index].underlyingDecimals,
            ),
            colSize: 2,
          },
          col4: {
            value: 'N/A',
            colSize: 2,
          },
          col5: {
            CellComponent: ActionsCell,
            colSize: 3,
            yieldToken: token,
            underlyingToken: $alusd.rows[index].underlyingToken,
            userDeposit: $alusd.rows[index].balance,
            loanRatio: utils.parseUnits($alusd.ratio, 18),
            borrowLimit: $alusd.rows[index].vaultDebt,
            openDebtAmount: utils.parseUnits($alusd.userDebt, 18),
            openDebtSymbol: 'alUSD',
            underlyingPricePerShare: $alusd.rows[index].underlyingPerShare,
            yieldPricePerShare: $alusd.rows[index].yieldPerShare,
            yieldDecimals: $alusd.rows[index].yieldDecimals,
            underlyingDecimals: $alusd.rows[index].underlyingDecimals,
            vaultIndex: index,
            aggregateBalance: $aggregate.balance,
          },
        },
      };
    }
    getRandomData();
  };

  $: noVaultsForStrategyText = {
    [TypeOfStrategies.USED]: $_('table.no_strategies'),
    [TypeOfStrategies.UNUSED]: $_('table.all_strategies'),
    [TypeOfStrategies.ALL]: `No strategies available at this moment.`,
  };

  const openBorrowModal = () =>
    showModal(Borrow, {
      selectedVaults: $vaultsSelector,
    });

  const openRepayModal = () =>
    showModal(Repay, {
      selectedVaultsType: $vaultsSelector,
      underlyingTokens: underlyingTokenAlusd,
      outstandingDebt: $alusd.userDebt,
    });

  const openLiquidateModal = () =>
    showModal(Liquidate, {
      outstandingDebt: $alusd.userDebt,
      yieldTokens: yieldTokenAlusd,
    });

  const closeModal = () => modalReset();

  let foo;
  const getRandomData = () => {
    foo = Math.floor(Math.random() * 100000);
  };

  $: if (!$alusd.loadingRowData) {
    renderVaults();
  }
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="yield_thin.svg"
      pageTitle="{$_('vaults_page.title')}"
      pageSubtitle="{$_('vaults_page.subtitle')}"
    />
  </div>
  {#if $vaultsLoading}
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 flex space-x-4">
        <p class="inline-block self-center">{$_('fetching_data')}</p>
      </div>
      <div slot="body">
        <div class="flex justify-center my-4">
          <BarLoader color="#F5C59F" />
        </div>
      </div>
    </ContainerWithHeader>
  {:else}
    <div class="w-full mb-8 grid grid-cols-2 gap-8">
      <div class="col-span-1">
        <ContainerWithHeader>
          <div slot="body">
            <div class=" items-center flex gap-1">
              {#if AllowedVaultTypes.length > 1}
                <Button
                  label="All Vaults"
                  width="w-max"
                  canToggle="{true}"
                  selected="{vaultsSelector.isSelectedAll($vaultsSelector, AllowedVaultTypes)}"
                  solid="{false}"
                  borderSize="0"
                  on:clicked="{() => vaultsSelector.select(AllowedVaultTypes)}"
                >
                  <p slot="leftSlot">
                    <img src="images/icons/alcx_med.svg" alt="all vaults" class="w-5 h-5" />
                  </p>
                </Button>
              {/if}
              {#each AllowedVaultTypes as vaultType}
                <Button
                  label="{VaultTypesInfos[vaultType].name}"
                  width="w-max"
                  canToggle="{true}"
                  selected="{vaultsSelector.isSelected($vaultsSelector, vaultType)}"
                  solid="{false}"
                  borderSize="0"
                  on:clicked="{() => vaultsSelector.select([vaultType])}"
                >
                  <p slot="leftSlot">
                    <img
                      src="{VaultTypesInfos[vaultType].icon}"
                      alt="{VaultTypesInfos[vaultType].name} vaults"
                      class="w-5 h-5"
                    />
                  </p>
                </Button>
              {/each}
            </div>
          </div>
        </ContainerWithHeader>
      </div>
      <div class="col-span-1 flex space-x-4">
        <Button label="{$_('vaults_page.borrow')}" width="w-full" on:clicked="{openBorrowModal}" />
        <Button label="{$_('vaults_page.repay')}" width="w-full" on:clicked="{openRepayModal}" />
        <Button label="{$_('vaults_page.liquidate')}" width="w-full" on:clicked="{openLiquidateModal}" />
      </div>
    </div>

    <div class="w-full mb-8">
      {#if showMetrics}
        <ContainerWithHeader>
          <div slot="header" class="py-4 px-6">
            <Metrics />
          </div>
        </ContainerWithHeader>
      {:else}
        <ContainerWithHeader canToggle="{true}" isVisible="{Math.floor($aggregate.totalDeposit) > 0}">
          <p slot="header" class="inline-block self-center">{$_('chart.aggregate')}</p>
          <div slot="body" class="bg-grey15">
            <AccountsPageBarCharts
              totalDeposit="{$aggregate.totalDeposit.toFixed(2)}"
              totalDebtLimit="{($aggregate.totalDeposit / 2).toFixed(2)}"
              aggregatedApy="0"
              totalDebt="{$aggregate.totalDebt.toFixed(2)}"
              totalInterest="0"
              forceState="{foo}"
            />
          </div>
        </ContainerWithHeader>
      {/if}
    </div>

    <div class="w-full mb-8">
      <ContainerWithHeader>
        <div slot="header" class="py-4 px-6 flex space-x-4">
          <Button
            label="{$_('table.your_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.USED],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.USED}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.USED;
            }}"
          />

          <Button
            label="{$_('table.all_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.ALL],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.ALL}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.ALL;
            }}"
          />

          <Button
            label="{$_('table.unused_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.UNUSED],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.UNUSED}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.UNUSED;
            }}"
          />
        </div>
        <div slot="body">
          {#if currentRowsOnCurrentStrategyType.length > 0}
            <Table
              rows="{[...currentRowsOnCurrentStrategyType.map((obj) => obj.row)]}"
              columns="{colsStrats}"
              key="{foo}"
            />
          {:else}
            <div class="flex justify-center my-4">
              <p>{noVaultsForStrategyText[currentStrategy]}</p>
            </div>
          {/if}
        </div>
      </ContainerWithHeader>
    </div>
  {/if}
</ViewContainer>
