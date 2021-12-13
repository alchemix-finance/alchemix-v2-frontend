import { writable } from 'svelte/store';

const toastConfig = writable({
  visible: false,
  kind: '',
  title: '',
  subtitle: '',
  spinner: true,
  showOpenButton: false,
  etherscanUrl: '',
  showCloseButton: false,
  closeTimeout: 10000,
  closeOnMount: true,
});

export default toastConfig;
