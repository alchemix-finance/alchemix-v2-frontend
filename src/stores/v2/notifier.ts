import { writable } from 'svelte/store';

export const createNotifyStore = <T>(defaultValue: T = undefined) => {
  const { subscribe, set, update } = writable<{ c: number; value: T }>({
    c: 0,
    value: defaultValue,
  });

  return {
    subscribe,
    set,
    update,
    notify: (value: T) => {
      update((prev) => {
        const _prev = prev;

        _prev.c = prev.c + 1;
        _prev.value = value;

        return _prev;
      });
    },
  };
};
