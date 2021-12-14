import { writable } from 'svelte/store';

const toastConfig = writable({
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
});

export default toastConfig;
