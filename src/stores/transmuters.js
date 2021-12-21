import { writable } from 'svelte/store';

const transmuters = writable({
  fetching: true,
});

export default transmuters;
