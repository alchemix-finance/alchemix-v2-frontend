<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import LocaleWrapper from '../LocaleWrapper.svelte';
  import AvatarWithIndicator from '../../components/elements/AvatarWithIndicator.svelte';
</script>

<Meta title="Decorative/AvatarWithIndicator" component="{AvatarWithIndicator}" />

<Template let:args>
  <LocaleWrapper>
    <AvatarWithIndicator {...args} />
  </LocaleWrapper>
</Template>

<Story name="AvatarWithIndicator" id="AvatarWithIndicatorStory" />
