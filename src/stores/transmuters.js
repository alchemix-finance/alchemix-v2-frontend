import { writable } from 'svelte/store';

const defaults = {
  fetching: true,
  state: [],
  props: [],
};

const transmuters = writable({
  ...defaults,
});

export const transmutersReset = () => {
  transmuters.set({ ...defaults });
};

export const transmuterContracts = ['TransmuterV2_DAI', 'TransmuterV2_USDC', 'TransmuterV2_USDT'];

export default transmuters;
