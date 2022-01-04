<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import LocaleWrapper from '../../../LocaleWrapper.svelte';
import Repay from '../../../../components/composed/Modals/vaults/Repay.svelte';

const props = {
  underlyingTokens: [
    {
      address: '0xdeadbeef',
      symbol: 'DAI',
      balance: '50000000000000000000',
      decimals: '18',
    },
  ],
  outstandingDebt: 100,
};
</script>

<Meta title="Modals/Vault/Repay" component="{Repay}" argTypes="{{}}" />

<Template let:args>
  <LocaleWrapper>
    <Repay {...args} />
  </LocaleWrapper>
</Template>

<Story id="RepayModal" name="Repay" args="{{ ...props }}" />
