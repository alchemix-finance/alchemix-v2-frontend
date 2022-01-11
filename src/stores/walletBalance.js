import { writable } from 'svelte/store';

const defaults = {
  tokens: [],
};

const walletBalance = writable({ ...defaults });

export const walletBalanceReset = () => {
  walletBalance.set({ ...defaults });
};

export default walletBalance;
