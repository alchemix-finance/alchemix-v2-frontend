<script>
  import { Story, Meta, Template } from '@storybook/addon-svelte-csf';
  import LocaleWrapper from '../../../LocaleWrapper.svelte';
  import Liquidate from '../../../../components/composed/Modals/vaults/Liquidate.svelte';

  const props = {
    outstandingDebt: 100,
    yieldTokens: [
      {
        symbol: 'yvDAI',
        address: '0xdeadbeef',
        balance: '50',
        decimals: '18',
        yieldPerShare: '1.01',
        underlyingPerShare: '0.99',
      },
    ],
  };
</script>

<Meta title="Modals/Vault/Liquidate" component="{Liquidate}" argTypes="{{ ...props }}" />

<Template let:args>
  <LocaleWrapper>
    <Liquidate {...args} />
  </LocaleWrapper>
</Template>

<Story id="LiquidateModal" name="Liquidate" args="{{ ...props }}" />
