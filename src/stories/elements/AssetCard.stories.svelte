<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import LocaleWrapper from '../LocaleWrapper.svelte';
  import AssetCard from '../../components/elements/AssetCard.svelte';
</script>

<Meta title="Decorative/Asset Card" component="{AssetCard}" />

<Template let:args>
  <LocaleWrapper>
    <AssetCard {...args} />
  </LocaleWrapper>
</Template>

<Story name="Asset Card" id="AssetCardStory" />
