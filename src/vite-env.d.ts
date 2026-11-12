/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  /** deepseek | openai-compatible custom */
  readonly VITE_LLM_PROVIDER?: string
  readonly VITE_DEEPSEEK_API_KEY?: string
  readonly VITE_LLM_API_KEY?: string
  readonly VITE_LLM_API_URL?: string
  readonly VITE_LLM_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
