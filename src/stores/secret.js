import { writable } from 'svelte/store';

const defaults = {
  unlocked: false,
};

const secret = writable({
  ...defaults,
});

export const secretReset = () => {
  secret.set({ ...defaults });
};

export default secret;
