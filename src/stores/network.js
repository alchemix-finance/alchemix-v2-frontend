import { writable } from 'svelte/store';

const network = writable({
  id: undefined,
});

export default network;
