<script>
import { getContext } from 'svelte';
import { _ } from 'svelte-i18n';
import { utils } from 'ethers';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import PageHeader from '../components/elements/PageHeader.svelte';
import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
import Button from '../components/elements/Button.svelte';
import AccountsPageBarCharts from '../components/composed/AccountsPageBarCharts.svelte';
import { BarLoader } from 'svelte-loading-spinners';
import account from '../stores/account';
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
import { modalStyle } from '../stores/modal';
import tempTx, { defaults } from '../stores/tempTx';
import { getProvider } from '../helpers/walletManager';
import getUserGas from '../helpers/getUserGas';
import { setPendingTx, setPendingWallet, setSuccessTx, setError } from '../helpers/setToast';
import setTokenAllowance from '../helpers/setTokenAllowance';
import CurrencyCell from '../components/composed/Table/CurrencyCell.svelte';
import ChildUpdater from '../components/elements/ChildUpdater.svelte';

let counterAllStrategies = 0;
let counterUserStrategies = 0;
let counterUnusedStrategies = 0;

let loading = true;

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

const { open } = getContext('simple-modal');
const { close } = getContext('simple-modal');
const openBorrowModal = () => {
  open(
    Borrow,
    {
      debtToken: {
        symbol: 'alUSD',
        address: '',
      },
      maxDebt: $alusd.maxDebt,
      currentDebt: $alusd.userDebt,
    },
    {
      ...modalStyle,
    },
  );
};
const openRepayModal = () => {
  open(
    Repay,
    {
      underlyingTokens: underlyingTokenAlusd,
      outstandingDebt: $alusd.userDebt,
    },
    {
      ...modalStyle,
    },
  );
};
const openLiquidateModal = () => {
  open(
    Liquidate,
    {
      outstandingDebt: $alusd.userDebt,
      yieldTokens: yieldTokenAlusd,
    },
    {
      ...modalStyle,
    },
  );
};
const closeModal = () => {
  close();
};

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
  const allowance = await getTokenAllowance($tempTx.yieldToken, $account.address, contract.address);
  const decimals = await getTokenDecimals($tempTx.yieldToken);
  const amountToWei = utils.parseUnits($tempTx.amount.toString(), decimals);
  if (!allowance) {
    await setTokenAllowance($tempTx.yieldToken, contract.address);
  }
  console.log('deposit config', amountToWei, utils.formatUnits(allowance.toString(), decimals));
  if ($tempTx.amount < 0) {
    setError('Trying to deposit more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await contract.deposit($tempTx.yieldToken, amountToWei, $account.address, {
        gasPrice: getUserGas(),
      });
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (e) {
      setError(e.message);
      console.debug(e);
    }
    tempClear();
  }
};

const depositUnderlying = async () => {
  console.log('depositing underlying');
  const allowanceUnderlying = await getTokenAllowance(
    $tempTx.underlyingToken,
    $account.address,
    contract.address,
  );
  const decimals = await getTokenDecimals($tempTx.underlyingToken);
  const amountToWei = utils.parseUnits($tempTx.amountUnderlying.toString(), decimals);
  const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
  if (!allowanceUnderlying) {
    await setTokenAllowance($tempTx.underlyingToken, contract.address);
  }
  console.log('deposit config', amountToWei, allowanceUnderlying);
  // TODO fix check for actual balance of token on wallet
  if ($tempTx.amount < 0) {
    setError('Trying to deposit more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      const dataPackage = abiCoder.encode(['bytes[]'], [[]]);
      tx = await contract.depositUnderlying($tempTx.yieldToken, amountToWei, $account.address, dataPackage, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (e) {
      setError(e.message);
      console.log(e);
    }
    tempClear();
  }
};

const multicall = async () => {
  const allowanceUnderlying = await getTokenAllowance(
    $tempTx.underlyingToken,
    $account.address,
    contract.address,
  );
  const allowanceYield = await getTokenAllowance($tempTx.yieldToken, $account.address, contract.address);
  const yieldToWei = utils.parseEther($tempTx.amountYield.toString());
  const underlyingToWei = utils.parseEther($tempTx.amountUnderlying.toString());
  if (!allowanceUnderlying) await setTokenAllowance($tempTx.underlyingToken, contract.address);
  if (!allowanceYield) await setTokenAllowance($tempTx.yieldToken, contract.address);
  try {
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
      gasPrice: getUserGas(),
    });
    setPendingTx();
    await provider.once(tx.hash, (transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (e) {
    setError(e.message);
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
    await provider.once(tx.hash, (transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (e) {
    setError(e.message);
    console.error(e);
  }
  tempClear();
};

const repay = async () => {
  const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
  try {
    setPendingWallet();
    const tx = await contract.repay($tempTx.underlyingToken, $tempTx.amountRepay, $account.address, {
      gasPrice: gas,
    });
    setPendingTx();
    await provider.once(tx.hash, (transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (e) {
    console.error(e);
    setError(e.message);
  }
  tempClear();
};

const liquidate = async () => {
  const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
  const dataPackage = abiCoder.encode(['bytes[]'], [[]]);
  try {
    setPendingWallet();
    const tx = await contract.liquidate($tempTx.yieldToken, $tempTx.amountRepay, dataPackage, {
      gasPrice: gas,
    });
    setPendingTx();
    await provider.once(tx.hash, (transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (e) {
    console.error(e);
    setError(e.message);
  }
  tempClear();
};

const withdraw = async () => {
  const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
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
    });
  } catch (e) {
    console.error(e);
    setError(e.message);
  }
  tempClear();
};

const withdrawUnderlying = async () => {
  const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
  const dataPackage = abiCoder.encode(['bytes[]'], [[]]);
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
    });
  } catch (e) {
    console.error(e);
    setError(e.message);
  }
  tempClear();
};

const withdrawMulticall = () => {
  setError('Multicall is not supported yet :(');
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
  liquidate: liquidate,
};

$: if ($tempTx.method !== null) {
  closeModal();
  methodLookup[$tempTx.method]();
}

const renderVaults = async () => {
  // alUSD Alchemist only atm
  if (!$alusd.loadingRowData) {
    for (const token of $alusd.yieldTokens) {
      const rowData = $alusd.rows.find((row) => row.token === token);
      yieldTokenAlusd.push({
        symbol: rowData.yieldSymbol,
        address: token,
        balance: rowData.balance,
        decimals: rowData.yieldDecimals,
        yieldPerShare: rowData.yieldPerShareFormatted,
        underlyingPerShare: rowData.underlyingPerShareFormatted,
      });
      underlyingTokenAlusd.push({
        symbol: rowData.underlyingSymbol,
        address: rowData.underlyingToken,
        balance: rowData.underlyingBalance,
        decimals: rowData.underlyingDecimals,
      });
      const payload = {
        type: rowData.stratIsUsed ? 'used' : 'unused',
        alchemist: 'alusd',
        row: {
          col2: {
            CellComponent: FarmNameCell,
            farmName: rowData.yieldSymbol,
            farmSubtitle: 'Yearn ' + rowData.underlyingSymbol,
            farmIcon: 'alusd_med.svg',
            tokenIcon: rowData.underlyingSymbol.toLowerCase(),
            colSize: 3,
            alignment: 'justify-self-start',
          },
          deposited: {
            CellComponent: CurrencyCell,
            value: (rowData.balance * rowData.underlyingPerShare) / 10 ** rowData.underlyingDecimals,
            colSize: 2,
          },
          limit: {
            CellComponent: CurrencyCell,
            value: rowData.vaultDebt.toString(),
            prefix: '+',
            colSize: 2,
          },
          col3: {
            CellComponent: CurrencyCell,
            value: utils.formatUnits(
              utils.parseUnits(rowData.tvl, rowData.underlyingDecimals).toString(),
              rowData.underlyingDecimals,
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
            underlyingToken: rowData.underlyingToken,
            userDeposit: rowData.balance,
            loanRatio: $alusd.ratio,
            borrowLimit: rowData.vaultDebt,
            openDebtAmount: $alusd.userDebt,
            openDebtSymbol: 'alUSD',
            underlyingPricePerShare: rowData.underlyingPerShareFormatted,
            yieldPricePerShare: rowData.yieldPerShareFormatted,
            yieldDecimals: rowData.yieldDecimals,
            underlyingDecimals: rowData.underlyingDecimals,
          },
        },
      };
      if (payload.type === 'used') {
        rowsUser.push(payload.row);
        rowsUser = rowsUser;
        counterUserStrategies += 1;
      } else {
        rowsUnused.push(payload.row);
        rowsUnused = rowsUnused;
        counterUnusedStrategies += 1;
      }
      rowsAll.push(payload.row);
      rowsAll = rowsAll;
      counterAllStrategies += 1;
    }
    loading = false;
    getRandomData();
  }
};

let foo;
const getRandomData = () => {
  foo = Math.floor(Math.random() * 100000);
};

$: if (!$alusd.loadingRowData) renderVaults();
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
    <div class="w-full mb-8 grid grid-cols-2 gap-8">
      <div class="col-span-1">
        <ContainerWithHeader>
          <div slot="body">
            <Button
              label="All Vaults"
              width="w-max"
              canToggle="{true}"
              selected="{toggleButtons.vaultSelect.all}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 0, filter: 'all' })}"
            >
              <p slot="leftSlot">
                <img src="images/icons/alcx_med.svg" alt="all vaults" class="w-5 h-5" />
              </p>
            </Button>
            <Button
              disabled
              label="alETH"
              width="w-max"
              canToggle="{true}"
              selected="{toggleButtons.vaultSelect.aleth}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 0, filter: 'aleth' })}"
            >
              <p slot="leftSlot">
                <img src="images/icons/aleth_med.svg" alt="aleth vaults" class="w-5 h-5" />
              </p>
            </Button>
            <Button
              label="alUSD"
              width="w-max"
              canToggle="{true}"
              selected="{toggleButtons.vaultSelect.alusd}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 0, filter: 'alusd' })}"
            >
              <p slot="leftSlot">
                <img src="images/icons/alusd_med.svg" alt="alusd vaults" class="w-5 h-5" />
              </p>
            </Button>
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
      <ContainerWithHeader canToggle="{true}" isVisible="{$aggregate.totalDeposit > 0}">
        <p slot="header" class="inline-block self-center">Aggregate</p>
        <div slot="body" class="bg-grey15">
          <AccountsPageBarCharts
            totalDeposit="{$aggregate.totalDeposit}"
            totalDebtLimit="{Math.floor($aggregate.totalDeposit / 2)}"
            aggregatedApy="0"
            totalDebt="{Math.floor($aggregate.totalDeposit / 4)}"
            totalInterest="0"
          />
        </div>
      </ContainerWithHeader>
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
            on:clicked="{() => vaultFilter({ id: 2, filter: 'used' })}"
          />

          <Button
            label="All Strategies ({counterAllStrategies})"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.stratSelect.all}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 2, filter: 'all' })}"
          />

          <Button
            label="Unused Strategies ({counterUnusedStrategies})"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.stratSelect.unused}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 2, filter: 'unused' })}"
          />
        </div>
        <div slot="body">
          {#if toggleButtons.stratSelect.used}
            {#if rowsUser.length > 0}
              <ChildUpdater key="{foo}">
                <Table rows="{rowsUser}" columns="{colsStrats}" />
              </ChildUpdater>
            {:else}
              <div class="flex justify-center my-4">
                <p>You don't have any active strategies.</p>
              </div>
            {/if}
          {:else if toggleButtons.stratSelect.all}
            <ChildUpdater key="{foo}">
              <Table rows="{rowsAll}" columns="{colsStrats}" />
            </ChildUpdater>
          {:else if toggleButtons.stratSelect.unused}
            {#if rowsUnused.length > 0}
              <ChildUpdater key="{foo}">
                <Table rows="{rowsUnused}" columns="{colsStrats}" />
              </ChildUpdater>
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
