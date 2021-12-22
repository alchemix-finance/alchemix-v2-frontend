import { writable } from 'svelte/store';

const transmuters = writable({
  fetching: true,
  state: [],
});

export default transmuters;
