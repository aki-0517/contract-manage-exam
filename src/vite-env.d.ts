/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MORALIS_API_KEY: string
  readonly VITE_PRIVY_APP_ID: string
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
