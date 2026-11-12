const DEEPSEEK_CHAT_URL = 'https://api.deepseek.com/chat/completions'

export function getEnvLlmCredentials() {
  const provider =
    import.meta.env.VITE_LLM_PROVIDER?.toLowerCase() || 'deepseek'
  const apiKey =
    import.meta.env.VITE_DEEPSEEK_API_KEY ||
    import.meta.env.VITE_LLM_API_KEY ||
    ''
  const model =
    import.meta.env.VITE_LLM_MODEL ||
    (provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini')
  const apiUrl =
    import.meta.env.VITE_LLM_API_URL ||
    (provider === 'deepseek' ? DEEPSEEK_CHAT_URL : '')

  return { provider, apiKey, model, apiUrl }
}

export function isLlmConfigured(): boolean {
  const { apiKey, apiUrl } = getEnvLlmCredentials()
  return Boolean(apiKey && apiUrl)
}

/** 仅内部后台展示 */
export function llmProviderLabelInternal(): string {
  const { provider } = getEnvLlmCredentials()
  if (!isLlmConfigured()) return '未配置密钥'
  return provider === 'deepseek' ? 'DeepSeek' : provider
}
