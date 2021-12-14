<script>
import { fly } from 'svelte/transition';
import toastConfig from '../../stores/toast.js';
import cn from 'classnames';
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

export let kind;
export let title;
export let subTitle;

export let showSpinner = true;

export let showOpenButton = true;
export let onClickOpen = () => {};

export let showCloseButton = true;
export let closeTimeoutMs = 10000;
export let closeOnMount = true;
export let onClickClose = () => {};

export let isOpen = true;
let handleClose = () => {
  clearTimeout(closeTimer);
  $toastConfig.visible = false;
  $toastConfig.kind = '';
  $toastConfig.title = '';
  $toastConfig.subtitle = '';
  $toastConfig.spinner = true;
  $toastConfig.showOpenButton = false;
  $toastConfig.etherscanUrl = '';
  $toastConfig.showCloseButton = true;
  $toastConfig.closeTimeout = 10000;
  $toastConfig.closeOnMount = true;
};

const closeTimer = () => {
  if (isOpen && closeOnMount) {
    setTimeout(() => {
      handleClose();
      onClickClose();
    }, closeTimeoutMs);
  }
};

$: isOpen, closeTimer();
</script>

{#if isOpen}
  <div class="fixed z-20 w-full">
    <div class="sticky mx-auto w-max" transition:fly="{{ y: -8, duration: 400 }}">
      <div
        class="{cn(
          'rounded-md border p-3 font-normal font-alcxTitles text-opacity-80',
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
            {#if showSpinner}
              <div class="absolute">
                <Circle color="white" size="32" />
              </div>
            {/if}
            <img src="images/alchemix_logo.png" alt="Alchemix loader" class="w-5 h-5" />
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
  </div>
{/if}
