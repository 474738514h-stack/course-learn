export interface TingwuSession {
  taskId: string
  meetingJoinUrl: string
}

export async function fetchTingwuStatus(): Promise<{ configured: boolean }> {
  const res = await fetch('/api/tingwu/status')
  if (!res.ok) return { configured: false }
  return res.json() as Promise<{ configured: boolean }>
}

export async function startTingwuSession(): Promise<TingwuSession> {
  const res = await fetch('/api/tingwu/start', { method: 'POST' })
  const data = (await res.json()) as TingwuSession & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || '无法创建听悟任务')
  }
  if (!data.meetingJoinUrl || !data.taskId) {
    throw new Error('听悟返回数据不完整')
  }
  return { taskId: data.taskId, meetingJoinUrl: data.meetingJoinUrl }
}

export async function stopTingwuSession(taskId: string): Promise<void> {
  const res = await fetch('/api/tingwu/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId }),
  })
  const data = (await res.json()) as { error?: string }
  if (!res.ok) {
    throw new Error(data.error || '无法结束听悟任务')
  }
}

export interface TingwuMessagePayload {
  index?: number
  result?: string
  stash_result?: { text?: string }
}

export interface TingwuMessage {
  header?: { name?: string }
  payload?: TingwuMessagePayload
}

export function parseTingwuMessage(raw: string): TingwuMessage | null {
  try {
    return JSON.parse(raw) as TingwuMessage
  } catch {
    return null
  }
}

export function extractInterimText(msg: TingwuMessage): string | null {
  if (msg.header?.name === 'TranscriptionResultChanged') {
    return msg.payload?.result ?? null
  }
  return null
}

export function extractFinalText(msg: TingwuMessage): string | null {
  if (msg.header?.name === 'SentenceEnd') {
    const main = msg.payload?.result ?? ''
    const stash = msg.payload?.stash_result?.text ?? ''
    return (main + stash).trim() || null
  }
  return null
}
