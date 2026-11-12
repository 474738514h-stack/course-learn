/** 从常见网课链接解析视频时长（秒），失败返回 null */

function parseBilibiliBvid(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('bilibili.com')) return null
    const m = u.pathname.match(/\/video\/(BV[A-Za-z0-9]+)/i)
    return m?.[1] ?? null
  } catch {
    return null
  }
}

function parseYoutubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1).split('/')[0] || null
    }
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v')
    }
    return null
  } catch {
    return null
  }
}

export async function fetchWebVideoDurationSec(
  sourceUrl: string
): Promise<number | null> {
  const bvid = parseBilibiliBvid(sourceUrl)
  if (bvid) {
    try {
      const path = `/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`
      let res = await fetch(`/api/bilibili${path}`)
      if (!res.ok) {
        res = await fetch(`https://api.bilibili.com${path}`)
      }
      const json = (await res.json()) as {
        data?: { duration?: number }
      }
      const d = json?.data?.duration
      if (typeof d === 'number' && d > 0) return d
    } catch {
      /* CORS 或网络失败 */
    }
  }

  const yt = parseYoutubeId(sourceUrl)
  if (yt) {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl)}&format=json`
      )
      if (res.ok) {
        /* oEmbed 无时长，仅占位；可扩展 invidious 等 */
      }
    } catch {
      /* ignore */
    }
  }

  return null
}

export function probeLocalMediaDurationSec(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const isVideo = file.type.startsWith('video/')
    const el = document.createElement(isVideo ? 'video' : 'audio')
    el.preload = 'metadata'
    const done = (sec: number | null) => {
      URL.revokeObjectURL(url)
      el.removeAttribute('src')
      el.load()
      resolve(sec)
    }
    el.onloadedmetadata = () => {
      const d = el.duration
      done(Number.isFinite(d) && d > 0 ? Math.round(d) : null)
    }
    el.onerror = () => done(null)
    el.src = url
  })
}
