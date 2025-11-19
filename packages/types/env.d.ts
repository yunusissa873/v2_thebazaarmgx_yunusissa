/* Augment Vite env typings for custom variables used by the BuildBadge */
interface ImportMetaEnv {
  readonly VITE_BUILD_TIME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_PWA?: 'true' | 'false'
  readonly VITE_SHOW_BADGE?: 'true' | 'false'
  readonly MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}