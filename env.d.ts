/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_BLOCKNATIVE_KEY: string;
  readonly VITE_NETWORK_ID: string;
  readonly VITE_NETWORK_NAME: string;
  readonly VITE_LOCAL_NETWORK_ID: string;
  readonly VITE_LOCAL_NETWORK_NAME: string;
  readonly VITE_LOCAL_NETWORK_URL: string;
  readonly VITE_ZAPPER_KEY: string;
  readonly VITE_APP_URL: string;
  readonly VITE_INFURA_KEY: string;
  readonly VITE_ALCHEMY_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
