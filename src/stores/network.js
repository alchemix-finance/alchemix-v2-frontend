import { writable } from 'svelte/store';

const defaults = {
  id: undefined,
};

const network = writable({
  ...defaults,
});

export const networkReset = () => {
  network.set({ ...defaults });
};

export default network;
