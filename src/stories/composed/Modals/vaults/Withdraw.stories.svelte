<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import Withdraw from '../../../../components/composed/Modals/vaults/Withdraw.svelte';
import LocaleWrapper from '../../../LocaleWrapper.svelte';
import walletBalance from '../../../../stores/walletBalance';

const props = {
  yieldToken: '0xdeadbeef',
  underlyingToken: '0xcafefeed',
  loanRatio: '2.0',
  borrowLimit: '50.0',
  userShares: '99.006582596769872212',
  openDebtAmount: '25.0',
  openDebtSymbol: 'alUSD',
  underlyingPricePerShare: '1.010033852064928643',
  yieldPricePerShare: '0.999992383231490907',
};

walletBalance.set({
  tokens: [
    {
      address: '0xdeadbeef',
      symbol: 'yvDAI',
      balance: '1337',
    },
    {
      address: '0xcafefeed',
      symbol: 'DAI',
      balance: '31337',
    },
  ],
});
</script>

<Meta
  title="Modals/Vault/Withdraw"
  component="{Withdraw}"
  argTypes="{{
    ...props,
  }}"
/>

<Template let:args>
  <LocaleWrapper>
    <Withdraw {...args} />
  </LocaleWrapper>
</Template>

<Story
  id="WithdrawModal"
  name="Withdraw"
  args="{{
    ...props,
  }}"
/>
