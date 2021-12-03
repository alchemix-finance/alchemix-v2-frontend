<script>
  import { _ } from 'svelte-i18n';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import PageHeader from '../components/elements/PageHeader.svelte';
  import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
  import Button from '../components/elements/Button.svelte';

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
    Object.keys(toggleButtons[selector]).forEach(entry => {
      if (toggleButtons[selector][entry] !== key) {
        toggleButtons[selector][entry] = false;
      }
    });
    toggleButtons[selector][key] = true;
  };

  // @dev logic for controlling the filtered views
  const vaultFilter = (filter) => {
    const selector = [
      'vaultSelect',
      'modeSelect',
      'stratSelect',
    ];
    buttonToggler(selector[filter.id], filter.filter);
  };
</script>

<ViewContainer>
  <div class='flex justify-between' slot='head'>
    <PageHeader
      pageIcon='vault_thin.svg'
      pageTitle={$_('vaults_page.title')}
      pageSubtitle={$_('vaults_page.subtitle')}
    />
  </div>

  <div class='w-full mb-8'>
    <ContainerWithHeader>
      <div slot='body' class='flex space-x-4 mx-4 my-2'>
        <Button
          label='All Vaults'
          width='w-max'
          canToggle={true}
          selected={toggleButtons.vaultSelect.all}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 0, filter: 'all'})}
        >
          <p slot='leftSlot'>
            <img src='images/icons/alcx_med.svg' alt='all vaults' class='w-5 h-5' />
          </p>
        </Button>
        <Button
          label='alETH'
          width='w-max'
          canToggle={true}
          selected={toggleButtons.vaultSelect.aleth}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 0, filter: 'aleth'})}
        >
          <p slot='leftSlot'>
            <img src='images/icons/aleth_med.svg' alt='aleth vaults' class='w-5 h-5' />
          </p>
        </Button>
        <Button
          label='alUSD'
          width='w-max'
          canToggle={true}
          selected={toggleButtons.vaultSelect.alusd}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 0, filter: 'alusd'})}
        >
          <p slot='leftSlot'>
            <img src='images/icons/alusd_med.svg' alt='alusd vaults' class='w-5 h-5' />
          </p>
        </Button>
      </div>
    </ContainerWithHeader>
  </div>

  <div class='w-full mb-8'>
    <ContainerWithHeader>
      <div slot='header' class='py-4 px-6 text-sm flex justify-between'>
        <p class='inline-block self-center'>
          Aggregate
        </p>
        <Button width='w-max' label=''>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            slot='rightSlot'
            class='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
            ></path>
          </svg>
        </Button>
      </div>
    </ContainerWithHeader>
  </div>

  <div class='w-full mb-8'>
    <ContainerWithHeader>
      <div slot='body' class='flex space-x-4 mx-4 my-2'>
        <Button
          label='Deposit & Withdraw'
          width='w-full'
          py='py-2'
          canToggle={true}
          selected={toggleButtons.modeSelect.deposit}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 1, filter: 'deposit'})}
        />
        <Button
          label='Borrow'
          width='w-full'
          canToggle={true}
          selected={toggleButtons.modeSelect.borrow}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 1, filter: 'borrow'})}
        />
        <Button
          label='Repay'
          width='w-full'
          canToggle={true}
          selected={toggleButtons.modeSelect.repay}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 1, filter: 'repay'})}
        />
        <Button
          label='Liquidate'
          width='w-full'
          canToggle={true}
          selected={toggleButtons.modeSelect.liquidate}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 1, filter: 'liquidate'})}
        />
      </div>
    </ContainerWithHeader>
  </div>

  <div class='w-full mb-8'>
    <ContainerWithHeader>
      <div slot='header' class='py-4 px-6 flex space-x-4'>

        <Button
          label='Your Strategies (0)'
          width='w-max'
          canToggle={true}
          selected={toggleButtons.stratSelect.used}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 2, filter: 'used'})}
        />

        <Button
          label='All Strategies (4)'
          width='w-max'
          canToggle={true}
          selected={toggleButtons.stratSelect.all}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 2, filter: 'all'})}
        />

        <Button
          label='Unused Strategies (4)'
          width='w-max'
          canToggle={true}
          selected={toggleButtons.stratSelect.unused}
          solid={false}
          borderSize='0'
          on:clicked={() => vaultFilter({id: 2, filter: 'unused'})}
        />

      </div>
    </ContainerWithHeader>
  </div>

</ViewContainer>
