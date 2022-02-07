<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import LocaleWrapper from '../../../LocaleWrapper.svelte';
  import Borrow from '../../../../components/composed/Modals/vaults/Borrow.svelte';

  const props = {
    debtToken: {
      symbol: 'alUSD',
      address: '',
    },
    maxDebt: 100,
    currentDebt: 0,
  };
</script>

<Meta title="Modals/Vault/Borrow" component="{Borrow}" argTypes="{{}}" />

<Template let:args>
  <LocaleWrapper>
    <Borrow {...args} />
  </LocaleWrapper>
</Template>

<Story id="BorrowModal" name="Borrow" args="{{ ...props }}" />
