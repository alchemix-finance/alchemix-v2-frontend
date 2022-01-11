import { writable } from 'svelte/store';

const defaults = {
  visible: false,
  kind: '',
  title: '',
  subtitle: '',
  spinner: true,
  showOpenButton: false,
  etherscanUrl: '',
  showCloseButton: true,
  closeTimeout: 10000,
  closeOnMount: true,
  forceClose: false,
};

const toastConfig = writable({
  ...defaults,
});

export const toastReset = () => {
  toastConfig.set({ ...defaults });
};

export default toastConfig;
