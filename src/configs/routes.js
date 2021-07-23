import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { wrap } from 'svelte-spa-router/wrap';

import Landing from '../views/Landing.svelte';
import Error from '../views/Error.svelte';
import Components from '../views/Components.svelte';

export const routes = {
  '/': wrap({
    component: Landing,
  }),
  '/components': wrap({
    component: Components,
  }),
};

routes['*'] = wrap({
  component: Error,
});
