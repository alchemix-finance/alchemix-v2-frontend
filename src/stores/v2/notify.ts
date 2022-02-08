import { writable } from 'svelte/store';

export const createNotifyStore = <T>(defaultValue: T = undefined) => {
  const { subscribe, set, update } = writable<{ updateCounter: number; value: T }>({
    updateCounter: 0,
    value: defaultValue,
  });

  return {
    subscribe,
    set,
    update,
    notify: (value: T) => {
      update((prev) => {
        const _prev = prev;

        _prev.updateCounter = prev.updateCounter + 1;
        _prev.value = value;

        return _prev;
      });
    },
  };
};
