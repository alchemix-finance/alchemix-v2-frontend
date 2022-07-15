import { writable } from 'svelte/store';

export function makeSelectorStore(defaultSelected: number[]) {
  const selectedStores = writable([...defaultSelected]);

  return {
    ...selectedStores,
    select: (id: number[]) => selectedStores.set(id),
    isSelected: (storeRef: number[], refIndex) => {
      return storeRef.includes(refIndex) && storeRef.length === 1;
    },
    isSelectedAll: (storeRef: number[], allStoreValues: number[]) => {
      return allStoreValues.every((i) => storeRef.includes(i));
    },
    clearSelected: () => selectedStores.set([]),
  };
}
