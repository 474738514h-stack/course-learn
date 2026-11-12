/** 将 API 原始错误转为用户可读说明 */
export function formatTranscriptionError(raw: string): string {
  if (
    raw.includes('Throttling.User') ||
    raw.includes('flow control') ||
    raw.includes('429')
  ) {
    return '通义听悟请求过于频繁（账号流控），请稍等 1～2 分钟后再点「开始听课」或「继续转写」。'
  }
  if (raw.includes('WebSocket') || raw.includes('听悟')) {
    return raw
  }
  return raw.length > 120 ? `${raw.slice(0, 120)}…` : raw
}
