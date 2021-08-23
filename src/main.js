import './styles/global.css';
import './locales/i18n';

import App from './App.svelte';

const app = new App({
  target: document.body,
});

export default app;
