<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import Withdraw from '../../../../components/composed/Modals/vaults/Withdraw.svelte';
import LocaleWrapper from '../../../LocaleWrapper.svelte';
import walletBalance from '../../../../stores/walletBalance';

const props = {
  yieldToken: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
  underlyingToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  loanRatio: '2.0',
  borrowLimit: '50',
  userShares: '99.005828484942579537',
  openDebtAmount: '0.0',
  openDebtSymbol: 'alUSD',
  underlyingPricePerShare: '1.010041545333956048',
  yieldPricePerShare: '0.999999999999999999',
  vaultIndex: 0,
  yieldDecimals: 18,
  underlyingDecimals: 18,
};

walletBalance.set({
  tokens: [
    {
      address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
      symbol: 'yvDAI',
      balance: '0.0',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      balance: '99779.206860148661822247',
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
