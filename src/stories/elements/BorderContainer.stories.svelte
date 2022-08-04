<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import LocaleWrapper from '../LocaleWrapper.svelte';
  import BorderContainer from '../../components/elements/BorderContainer.svelte';
</script>

<Meta title="Decorative/BorderContainer" component="{BorderContainer}" />

<Template let:args>
  <LocaleWrapper>
    <BorderContainer {...args}>
      <p>This content is contained within a nice border with proper padding.</p>
    </BorderContainer>
  </LocaleWrapper>
</Template>

<Story name="BorderContainer" id="BorderContainerStory" />
