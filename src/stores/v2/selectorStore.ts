import { writable } from 'svelte/store';

function makeSelectorStore(defaultSelected: number[]) {
  const selectedStores = writable([...defaultSelected]);

  return {
    ...selectedStores,
    select: (id: number[]) => selectedStores.set(id),
    isSelected: (storeRef: number[], refIndex) => {
      if (storeRef.includes(refIndex) && storeRef.length === 1) {
        return true;
      }

      return false;
    },
    isSelectedAll: (storeRef: number[], allStoreValues: number[]) => {
      return allStoreValues.every((i) => storeRef.includes(i));
    },
    clearSelected: () => selectedStores.set([]),
  };
}

export default makeSelectorStore;
