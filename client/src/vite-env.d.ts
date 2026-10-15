/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string
  readonly VITE_QUIZ_API_BASE_URL?: string
  readonly VITE_PORT?: string
  readonly VITE_ALLOW_HOST?: string
  readonly VITE_ALLOW_HOST_WWW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
