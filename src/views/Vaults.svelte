<script>
import { _ } from 'svelte-i18n';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import PageHeader from '../components/elements/PageHeader.svelte';
import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
import Button from '../components/elements/Button.svelte';
import AccountsPageBarCharts from '../components/composed/AccountsPageBarCharts.svelte';

const toggleButtons = {
  vaultSelect: {
    all: true,
    aleth: false,
    alusd: false,
  },
  modeSelect: {
    deposit: true,
    borrow: false,
    repay: false,
    liquidate: false,
  },
  stratSelect: {
    used: true,
    all: false,
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
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="yield_thin.svg"
      pageTitle="{$_('vaults_page.title')}"
      pageSubtitle="{$_('vaults_page.subtitle')}"
    />
  </div>

  <div class="w-full mb-8 grid grid-cols-3 gap-8">
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
    <div class="col-span-2">
      <ContainerWithHeader>
        <div slot="body" class="flex space-x-4">
          <Button
            label="Deposit & Withdraw"
            width="w-full"
            py="py-2"
            canToggle="{true}"
            selected="{toggleButtons.modeSelect.deposit}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 1, filter: 'deposit' })}"
          />
          <Button
            label="Borrow"
            width="w-full"
            canToggle="{true}"
            selected="{toggleButtons.modeSelect.borrow}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 1, filter: 'borrow' })}"
          />
          <Button
            label="Repay"
            width="w-full"
            canToggle="{true}"
            selected="{toggleButtons.modeSelect.repay}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 1, filter: 'repay' })}"
          />
          <Button
            label="Liquidate"
            width="w-full"
            canToggle="{true}"
            selected="{toggleButtons.modeSelect.liquidate}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 1, filter: 'liquidate' })}"
          />
        </div>
      </ContainerWithHeader>
    </div>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader canToggle="{true}">
      <p slot="header" class="inline-block self-center">Aggregate</p>
      <div slot="body" class="bg-grey15">
        <AccountsPageBarCharts />
      </div>
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 flex space-x-4">
        <Button
          label="Your Strategies (0)"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.stratSelect.used}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 2, filter: 'used' })}"
        />

        <Button
          label="All Strategies (4)"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.stratSelect.all}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 2, filter: 'all' })}"
        />

        <Button
          label="Unused Strategies (4)"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.stratSelect.unused}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 2, filter: 'unused' })}"
        />
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
