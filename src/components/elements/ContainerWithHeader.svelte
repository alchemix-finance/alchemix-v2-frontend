<svelte:options accessors />

<script>
  import { slide } from 'svelte/transition';
  import Button from './Button.svelte';
  import settings from '@stores/settings';

  export let canToggle = false;
  export let addToggleSpacing = true;
  export let toggleOnlyOnButton = false;
  export let isVisible = true;
  export let disableButton = false;
  export let fullWidth = true;
  export let contentVisible = true;
  export let noBorder = false;

  export function toggleVisibility() {
    contentVisible = !contentVisible;
  }

  $: isVisible, (contentVisible = isVisible);
</script>

<div
  class="{fullWidth ? 'w-full' : 'w-max'} relative {noBorder
    ? ''
    : `rounded border ${
        $settings.invertColors ? 'border-grey10inverse' : 'border-grey10'
      }`} {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}"
>
  {#if $$slots.header}
    <div class="{$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'} w-full">
      {#if canToggle}
        <div
          class="{addToggleSpacing
            ? 'py-4 px-6 justify-between text-sm'
            : 'p-4 space-x-4'} flex {toggleOnlyOnButton ? '' : 'cursor-pointer'}"
          on:click="{() => (disableButton || toggleOnlyOnButton ? null : toggleVisibility())}"
        >
          {#if addToggleSpacing}
            <slot name="header" />
          {:else}
            <div class="flex-grow">
              <slot name="header" />
            </div>
          {/if}
          <Button
            width="w-max"
            label=""
            disabled="{disableButton}"
            on:clicked="{() => {
              if (toggleOnlyOnButton) toggleVisibility();
            }}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              slot="rightSlot"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {#if !contentVisible}
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              {:else}
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                ></path>
              {/if}
            </svg>
          </Button>
        </div>
      {:else}
        <slot name="header" />
      {/if}
    </div>
  {/if}
  {#if $$slots.body}
    {#if canToggle && contentVisible}
      <div class="w-full" transition:slide|local>
        <slot name="body" />
      </div>
    {:else if contentVisible}
      <div class="w-full">
        <slot name="body" />
      </div>
    {/if}
  {/if}
</div>
