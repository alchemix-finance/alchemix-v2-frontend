<script>
import { Meta, Story } from '@storybook/addon-svelte-csf';
import Wallet from '../../components/composed/Wallet.svelte';
import LocaleWrapper from '../LocaleWrapper.svelte';
</script>

<Meta title="Functional/Wallet" component="{Wallet}" />

<Story name="Wallet" id="WalletStory">
  <LocaleWrapper>
    <Wallet />
  </LocaleWrapper>
</Story>
