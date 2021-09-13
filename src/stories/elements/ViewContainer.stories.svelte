<script>
import { Meta, Story } from '@storybook/addon-svelte-csf';
import ViewContainer from '../../components/elements/ViewContainer.svelte';
</script>

<Meta title="Decorative/View Container" component="{ViewContainer}" />

<Story name="With Header Content">
  <ViewContainer>
    <p slot="head">This is rendered inside the head area.</p>
    <p>This is rendered inside the main body.</p>
    <p>All content has uniform margins.</p>
  </ViewContainer>
</Story>

<Story name="Without Header Content">
  <ViewContainer>
    <p>This is rendered inside the main body.</p>
    <p>There is no header to be rendered.</p>
  </ViewContainer>
</Story>
