import { writable } from 'svelte/store';

import { globalHistory } from 'svelte-routing/src/history';

const navigationStore = writable({
  currentPathname: window.location.pathname.slice(1),
});

export function updatePath(pathname: string, onUpdatePath?: (pathname: string) => void) {
  navigationStore.set({
    currentPathname: pathname,
  });

  onUpdatePath?.(pathname);
}

globalHistory.listen(({ location }) => {
  navigationStore.set({
    currentPathname: location.pathname.slice(1),
  });
});

export default navigationStore;
