<script>
  import { fly } from 'svelte/transition';
  import toastConfig from '../../stores/toast.js';
  import settings from '@stores/settings';
  import cn from 'classnames';
  import { Circle } from 'svelte-loading-spinners';

  import ToastIconButton from './ToastIconButton.svelte';

  const TOAST_KINDS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error',
  };

  const pendingProps = {
    'bg-bronze4': true,
    'border-bronze1': true,
  };

  const pendingPropsLight = {
    'bg-bronze3': true,
    'border-bronze1': true,
    'bg-opacity-30': true,
    filter: true,
    'drop-shadow-xl': true,
    'backdrop-filter': true,
    'backdrop-blur': true,
  };

  const successProps = {
    'bg-black2': true,
    'border-green2': true,
  };

  const successPropsLight = {
    'bg-green7': true,
    'border-green2': true,
    'bg-opacity-30': true,
    filter: true,
    'drop-shadow-xl': true,
    'backdrop-filter': true,
    'backdrop-blur': true,
  };

  const errorProps = {
    'bg-red2': true,
    'border-red3': true,
  };

  const errorPropsLight = {
    'bg-red5': true,
    'border-red3': true,
    'bg-opacity-30': true,
    filter: true,
    'drop-shadow-xl': true,
    'backdrop-filter': true,
    'backdrop-blur': true,
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
  export let forceCloseToast = false;
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
  $: closeOnMount, closeTimer();
  $: forceCloseToast, handleClose();
</script>

{#if isOpen}
  <div class="fixed z-20 w-full pointer-events-none">
    <div class="sticky mx-auto max-w-max" transition:fly="{{ y: -8, duration: 400 }}">
      <div
        class="{cn(
          'rounded-md border p-3 font-normal font-alcxTitles text-opacity-80',
          {
            [TOAST_KINDS.SUCCESS]: $settings.invertColors ? successPropsLight : successProps,
            [TOAST_KINDS.ERROR]: $settings.invertColors ? errorPropsLight : errorProps,
            [TOAST_KINDS.PENDING]: $settings.invertColors ? pendingPropsLight : pendingProps,
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
                [TOAST_KINDS.PENDING]: 'bg-bronze4',
              }[kind],
            )}"
          >
            {#if showSpinner}
              <div class="absolute">
                <Circle color="#F5C59F" size="32" />
              </div>
            {/if}
            <img src="images/alchemix_logo.png" alt="Alchemix loader" class="w-5 h-5" />
          </div>
          <div class="ml-2 mr-6 max-w-xs">
            <p>{title}</p>
            <p>
              {subTitle}
            </p>
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
