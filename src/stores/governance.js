import { writable } from 'svelte/store';

const defaults = {
  fetching: true,
  proposals: [],
};

const governance = writable({
  ...defaults,
});

export const governanceReset = () => {
  governance.set({ ...defaults });
};

export default governance;
