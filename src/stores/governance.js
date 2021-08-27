import { writable } from 'svelte/store';

const governance = writable({
  fetching: true,
  proposals: [],
});

export default governance;
