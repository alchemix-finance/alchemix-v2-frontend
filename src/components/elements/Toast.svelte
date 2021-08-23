<script>
import cn from 'classnames';
import { onMount } from 'svelte';
import { Circle } from 'svelte-loading-spinners';

import ToastIconButton from './ToastIconButton.svelte';

const TOAST_KINDS = {
  SUCCESS: 'success',
  ERROR: 'error',
};

const successProps = {
  'bg-black1': true,
  'border-green2': true,
};

const errorProps = {
  'bg-red2': true,
  'border-red3': true,
};

export let kind = TOAST_KINDS.SUCCESS;
export let title = 'Depositing 21.2';
export let subTitle = 'to ...';

export let showOpenButton = true;
export let onClickOpen = () => {};

export let showCloseButton = true;
export let closeTimeoutMs = 10000;
export let closeOnMount = true;
export let onClickClose = () => {};

let isOpen = true;
let handleClose = () => {
  isOpen = false;
};

onMount(() => {
  if (closeOnMount) {
    setTimeout(() => {
      handleClose();
      onClickClose();
    }, closeTimeoutMs);
  }
});
</script>

{#if isOpen}
  <div class="flex">
    <div
      class="{cn(
        'rounded-md border-2 p-3 font-normal font-alcxTitles text-opacity-80',
        {
          [TOAST_KINDS.SUCCESS]: successProps,
          [TOAST_KINDS.ERROR]: errorProps,
        }[kind],
      )}"
    >
      <div class="flex flex-row">
        <div
          class="{cn(
            'rounded-full h-8 w-8 relative flex justify-center items-center absolute',
            {
              [TOAST_KINDS.SUCCESS]: 'bg-green2',
              [TOAST_KINDS.ERROR]: 'bg-red4',
            }[kind],
          )}"
        >
          <div class="absolute">
            <Circle color="white" size="32" />
          </div>
          <img
            src="images/alchemix_logo.png"
            alt="Alchemix loader"
            class="w-5 h-5"
          />
        </div>
        <div class="ml-2 mr-6">
          <span>{title}</span>
          <span class="block">
            {subTitle}
          </span>
        </div>
        <div class="flex">
          {#if showOpenButton}
            <ToastIconButton icon="open" onClick="{onClickOpen}" />
          {/if}
          {#if showCloseButton}
            <ToastIconButton icon="close" onClick="{handleClose}" />
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
