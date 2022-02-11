<script lang="ts">
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

  import { vaultsStore, VaultsType } from '@stores/v2/alcxStore';
  import { VaultTypes } from 'src/stores/v2/types';
  import { AllowedVaultTypes, VaultTypesInfos } from 'src/stores/v2/constants';
  import makeSelectorStore from 'src/stores/v2/selectorStore';

  const vaultsSelector = makeSelectorStore([VaultTypes.alUSD]);

  let counterAllStrategies = 0;
  let counterUserStrategies = 0;
  let counterUnusedStrategies = 0;

  let loading = true;
  const showMetrics = true;

  let rowsAll = [];
  let rowsUser = [];
  let rowsUnused = [];
  let colsStrats = [
    {
      columnId: 'col2',
      CellComponent: HeaderCell,
      value: 'Strategy',
      colSize: 3,
    },
    {
      columnId: 'deposit',
      CellComponent: HeaderCell,
      value: 'Deposited',
      colSize: 2,
    },
    {
      columnId: 'limit',
      CellComponent: HeaderCell,
      value: 'Debt Limit',
      colSize: 2,
    },
    {
      columnId: 'col3',
      CellComponent: HeaderCell,
      value: 'TVL',
      colSize: 2,
    },
    {
      columnId: 'col4',
      CellComponent: HeaderCell,
      value: 'APY',
      colSize: 2,
    },
    {
      columnId: 'col5',
      CellComponent: HeaderCell,
      value: 'Actions',
      colSize: 3,
    },
  ];

  let underlyingTokenAlusd = [];
  let yieldTokenAlusd = [];

  const openBorrowModal = () =>
    showModal(Borrow, {
      debtToken: {
        symbol: 'alUSD',
        address: '',
      },
      maxDebt: $alusd.maxDebt,
      currentDebt: $alusd.userDebt,
    });

  const openRepayModal = () =>
    showModal(Repay, {
      underlyingTokens: underlyingTokenAlusd,
      outstandingDebt: $alusd.userDebt,
    });

  const openLiquidateModal = () =>
    showModal(Liquidate, {
      outstandingDebt: $alusd.userDebt,
      yieldTokens: yieldTokenAlusd,
    });

  const closeModal = () => modalReset();

  const toggleButtons = {
    vaultSelect: {
      all: true,
      aleth: false,
      alusd: false,
    },
    stratSelect: {
      used: false,
      all: true,
      unused: false,
    },
  };

  const buttonToggler = (selector, key) => {
    Object.keys(toggleButtons[selector]).forEach((entry) => {
      if (toggleButtons[selector][entry] !== key) {
        toggleButtons[selector][entry] = false;
      }
    });
    toggleButtons[selector][key] = true;
  };

  // @dev logic for controlling the filtered views
  const vaultFilter = (filter) => {
    const selector = ['vaultSelect', 'modeSelect', 'stratSelect'];
    buttonToggler(selector[filter.id], filter.filter);
  };

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
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
      if (!allowance) {
        await setTokenAllowance($tempTx.yieldToken, contract.address);
      }
      let tx;
      setPendingWallet();
      tx = await contract.deposit($tempTx.yieldToken, amountToWei, $account.address, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
        refreshData({ token: $tempTx.yieldToken, vaultIndex: $tempTx.vaultIndex });
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
      const dataPackage = utils.parseEther('0');
      const tx = await contract.depositUnderlying(
        $tempTx.yieldToken,
        amountToWei,
        $account.address,
        dataPackage,
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
      const underlyingData = abiCoder.encode(['bytes[]'], [[]]);
      const depositUnderlying = contractIface.encodeFunctionData('depositUnderlying', [
        $tempTx.yieldToken,
        underlyingToWei,
        $account.address,
        underlyingData,
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
    const dataPackage = utils.parseEther('0');
    try {
      setPendingWallet();
      const tx = await contract.liquidate($tempTx.yieldToken, $tempTx.amountRepay, dataPackage, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, async (transaction) => {
        setSuccessTx(transaction.transactionHash);
        await updateAlusdAggregate();
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
    console.log($tempTx);
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    const dataPackage = utils.parseEther('0');
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
        dataPackage,
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
    const dataPackage = utils.parseEther('0');
    try {
      const withdrawUnderlyingEncoded = contractIface.encodeFunctionData('withdrawUnderlying', [
        $tempTx.yieldToken,
        $tempTx.amountUnderlying,
        $account.address,
        dataPackage,
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
    if (payload.token)
      await updateWalletBalance(payload.token).catch((e) =>
        console.error(`[Vaults.svelte/refreshData/updateWalletBalance]: ${e}`),
      );
    if (payload.vaultIndex)
      await updateAlusdVault(payload.vaultIndex).catch((e) =>
        console.error(`[Vaults.svelte/refreshData/updateAlusdVault]: ${e}`),
      );
    const indexLocal = rowsAll.findIndex((row) => row.col5.vaultIndex === payload.vaultIndex);
    const indexStore = $alusd.rows.findIndex((row) => row.token === rowsAll[indexLocal].col5.yieldToken);
    rowsAll[indexLocal].deposited.value =
      ($alusd.rows[indexStore].balance * $alusd.rows[indexStore].underlyingPerShare) /
      10 ** $alusd.rows[indexStore].underlyingDecimals;
    rowsAll[indexLocal].limit.value = $alusd.rows[indexStore].vaultDebt.toString();
    rowsAll[indexLocal].col3.value = utils.formatUnits(
      utils.parseUnits($alusd.rows[indexStore].tvl, $alusd.rows[indexStore].underlyingDecimals).toString(),
      $alusd.rows[indexStore].underlyingDecimals,
    );
    rowsAll[indexLocal].col5.userDeposit = $alusd.rows[indexStore].balance;
    rowsAll[indexLocal].col5.borrowLimit = $alusd.rows[indexStore].vaultDebt;
    rowsAll[indexLocal].col5.openDebtAmount = $alusd.userDebt;

    getRandomData();
  };

  const strategyTypes = {
    used: (_vault) => _vault.balance.gt(BigNumber.from(0)),
    unused: (_vault) => _vault.balance.lte(BigNumber.from(0)),
    all: (_vault) => true,
  };

  let currentStrategy = strategyTypes['all'];

  $: currentVaultsBasedOnType =
    Object.keys($vaultsStore)
      .map((vTypeId) => {
        if ($vaultsSelector.includes(parseInt(vTypeId))) {
          return $vaultsStore[parseInt(vTypeId)].vaultBody;
        }
      })
      .filter((elm) => elm !== undefined)
      .reduce((accumulator, value) => accumulator.concat(value), []) ?? [];

  $: currentVaultsBasedOnStrategyType = currentVaultsBasedOnType.filter(currentStrategy) ?? [];

  $: currentRowsOnCurrentStrategyType = currentVaultsBasedOnStrategyType.map((vault, index) => {
    console.log(vault);

    return {
      type: vault.isUsed ? 'used' : 'unused',
      alchemist: 'alusd',
      row: {
        col2: {
          CellComponent: FarmNameCell,
          farmName: vault.symbol,
          farmSubtitle: 'Yearn ' + vault.underlyingSymbol,
          farmIcon: 'alusd_med.svg',
          tokenIcon: `${vault.underlyingSymbol}`.toLowerCase(),
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
                .div(BigNumber.from(10).pow(vault.underlyingDecimals)),
              vault.underlyingDecimals,
            ) ?? 0,
          colSize: 2,
        },
        limit: {
          CellComponent: CurrencyCell,
          value: utils.formatUnits(vault.debt, vault.underlyingDecimals),
          prefix: '+',
          colSize: 2,
        },
        col3: {
          CellComponent: CurrencyCell,
          value: utils.formatUnits(vault.tvl, vault.underlyingDecimals),
          colSize: 2,
        },
        col4: {
          value: 'N/A',
          colSize: 2,
        },
        col5: {
          CellComponent: ActionsCell,
          colSize: 3,
          yieldToken: vault.address,
          underlyingToken: vault.underlyingAddress,
          userDeposit: vault.balance,
          loanRatio: utils.parseUnits($alusd.ratio, 18),
          borrowLimit: vault.debt,
          openDebtAmount: utils.parseUnits('0', 18), // Fix
          openDebtSymbol: 'alUSD',
          underlyingPricePerShare: vault.underlyingPerShare,
          yieldPricePerShare: vault.yieldPerShare,
          yieldDecimals: vault.decimals,
          underlyingDecimals: vault.underlyingDecimals,
          vaultIndex: index,
          aggregateBalance: $aggregate.balance,
        },
      },
    };
  });

  $: console.log('old', rowsAll);

  $: console.log('strategies', currentRowsOnCurrentStrategyType);

  function reactiveVaultsRendering(_vaultsStore, _selectedVaultsStore) {
    if (!_vaultsStore) {
      console.error('[reactiveVaultsRendering]: vaultStore is empty!');
      return [];
    }

    let bvaults = Object.keys(_vaultsStore)
      .map((vTypeId) => {
        if (_selectedVaultsStore.includes(parseInt(vTypeId))) {
          return _vaultsStore[parseInt(vTypeId)].vaultBody;
        }
      })
      .filter((elm) => elm !== undefined)
      .reduce((accumulator, value) => accumulator.concat(value), []);
    // .filter((v) => v.balance.lte(BigNumber.from(0)));

    return bvaults;
  }

  const renderVaults = async () => {
    // alUSD Alchemist only atm
    console.log($alusd.debtToken);
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
            // value:
            //   ($alusd.rows[index].balance * $alusd.rows[index].underlyingPerShare) /
            //   10 ** $alusd.rows[index].underlyingDecimals,
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
      if (payload.type === 'used') {
        rowsUser.push(payload.row);
        // rowsUser = rowsUser;
        counterUserStrategies += 1;
      } else {
        rowsUnused.push(payload.row);
        // rowsUnused = rowsUnused;
        counterUnusedStrategies += 1;
      }
      rowsAll.push(payload.row);
      // rowsAll = rowsAll;
      counterAllStrategies += 1;
    }
    loading = false;
    getRandomData();
  };

  let foo;
  const getRandomData = () => {
    foo = Math.floor(Math.random() * 100000);
  };

  $: if (!$alusd.loadingRowData && loading) {
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
  {#if loading}
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
    {#each reactiveVaultsRendering($vaultsStore, $vaultsSelector) as vault}
      {vault.symbol}
    {/each}
    <div class="w-full mb-8 grid grid-cols-2 gap-8">
      <div class="col-span-1">
        <ContainerWithHeader>
          <div slot="body">
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
        </ContainerWithHeader>
      </div>
      <div class="col-span-1 flex space-x-4">
        <Button label="Borrow" width="w-full" on:clicked="{openBorrowModal}" />
        <Button label="Repay" width="w-full" on:clicked="{openRepayModal}" />
        <Button label="Liquidate" width="w-full" on:clicked="{openLiquidateModal}" />
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
          <p slot="header" class="inline-block self-center">Aggregate</p>
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
            label="Your Strategies ({counterUserStrategies})"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.stratSelect.used}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              vaultFilter({ id: 2, filter: 'used' });
              currentStrategy = strategyTypes['used'];
            }}"
          />

          <Button
            label="All Strategies ({counterAllStrategies})"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.stratSelect.all}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              vaultFilter({ id: 2, filter: 'all' });
              currentStrategy = strategyTypes['all'];
            }}"
          />

          <Button
            label="Unused Strategies ({counterUnusedStrategies})"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.stratSelect.unused}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              vaultFilter({ id: 2, filter: 'unused' });
              currentStrategy = strategyTypes['unused'];
            }}"
          />
        </div>
        <div slot="body">
          {#if toggleButtons.stratSelect.used}
            {#if rowsUser.length > 0}
              <Table rows="{rowsUser}" columns="{colsStrats}" key="{foo}" />
            {:else}
              <div class="flex justify-center my-4">
                <p>You don't have any active strategies.</p>
              </div>
            {/if}
          {:else if toggleButtons.stratSelect.all}
            <Table
              rows="{[...currentRowsOnCurrentStrategyType.map((obj) => obj.row)]}"
              columns="{colsStrats}"
              key="{foo}"
            />
          {:else if toggleButtons.stratSelect.unused}
            {#if rowsUnused.length > 0}
              <Table rows="{rowsUnused}" columns="{colsStrats}" key="{foo}" />
            {:else}
              <div class="flex justify-center my-4">
                <p>You are using all available strategies.</p>
              </div>
            {/if}
          {/if}
        </div>
      </ContainerWithHeader>
    </div>
  {/if}
</ViewContainer>
