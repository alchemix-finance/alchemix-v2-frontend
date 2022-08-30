import { writable } from 'svelte/store';

const defaults = {
  fetching: true,
  proposals: [],
  userVotes: [],
  hasActiveVotes: false,
};

const governance = writable({
  ...defaults,
});

export const governanceReset = () => {
  governance.set({ ...defaults });
};

export default governance;
