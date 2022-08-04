import { writable } from 'svelte/store';

const backgroundLoading = writable({
  active: false,
  message: null,
});

export default backgroundLoading;
