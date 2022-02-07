<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import LocaleWrapper from '../LocaleWrapper.svelte';
  import Button from '../../components/elements/Button.svelte';
</script>

<Meta title="Inputs/Button" component="{Button}" />

<Template let:args>
  <LocaleWrapper>
    <Button {...args} />
  </LocaleWrapper>
</Template>

<Story name="Button" id="ButtonStory" />
