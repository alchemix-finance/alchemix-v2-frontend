import { writable } from 'svelte/store';

const global = writable({
  loading: false,
  alert: {
    type: undefined,
    message: undefined,
  },
});

export default global;
