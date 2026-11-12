export interface ParsedCourseLink {
  platform: string
  titleHint: string
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment.replace(/\+/g, ' '))
  } catch {
    return segment
  }
}

export function parseCourseLink(raw: string): ParsedCourseLink | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const pathParts = url.pathname.split('/').filter(Boolean)
    const last = pathParts[pathParts.length - 1]
    const queryTitle = url.searchParams.get('title') || url.searchParams.get('name')

    if (host.includes('bilibili.com') || host === 'b23.tv') {
      const id = pathParts.find((p) => p.startsWith('BV')) || last || '视频'
      return { platform: '哔哩哔哩', titleHint: queryTitle || id }
    }
    if (host.includes('youtube.com') || host === 'youtu.be') {
      const id = host === 'youtu.be' ? pathParts[0] : url.searchParams.get('v') || last
      return { platform: 'YouTube', titleHint: queryTitle || id || '视频课程' }
    }
    if (host.includes('qq.com') || host.includes('v.qq.com')) {
      return { platform: '腾讯视频', titleHint: queryTitle || last || '视频课程' }
    }
    if (host.includes('youku.com')) {
      return { platform: '优酷', titleHint: queryTitle || last || '视频课程' }
    }
    if (host.includes('ixigua.com')) {
      return { platform: '西瓜视频', titleHint: queryTitle || last || '视频课程' }
    }
    if (host.includes('douyin.com')) {
      return { platform: '抖音', titleHint: queryTitle || last || '短视频课程' }
    }
    if (host.includes('xuexi.cn')) {
      return { platform: '学习强国', titleHint: queryTitle || '专题课程' }
    }
    if (host.includes('smartedu.cn')) {
      return { platform: '国家智慧教育平台', titleHint: queryTitle || last || '课程' }
    }
    if (host.includes('classin.com') || host.includes('eeo.cn')) {
      return { platform: 'ClassIn', titleHint: queryTitle || '在线课堂' }
    }
    if (host.includes('dingtalk.com')) {
      return { platform: '钉钉', titleHint: queryTitle || '直播/录播' }
    }
    if (host.includes('feishu.cn') || host.includes('larkoffice.com')) {
      return { platform: '飞书', titleHint: queryTitle || '会议/课程' }
    }
    if (host.includes('zoom.us')) {
      return { platform: 'Zoom', titleHint: queryTitle || '会议' }
    }

    const site = host.split('.').slice(-2, -1)[0] || host
    const hint = queryTitle || (last ? decodeSegment(last) : host)
    return { platform: site || '网页', titleHint: hint || '网页课程' }
  } catch {
    return null
  }
}

/** 无法从链接解析出可读名称时的占位 */
export function fallbackCourseTitleHint(titleHint: string): string {
  const t = titleHint.trim()
  if (!t) return '课程'
  if (/^BV[A-Za-z0-9]+$/.test(t)) return '课程'
  if (!/[\u4e00-\u9fff]/.test(t) && /^[a-zA-Z0-9_-]+$/.test(t) && t.length >= 6) {
    return '课程'
  }
  return t
}

/** 临时课程名：课程名称·x月x日 xx:xx */
export function formatCourseNameWithNow(titleHint: string): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  const base = fallbackCourseTitleHint(titleHint)
  return `${base}·${stamp}`
}

export function stripFileExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '').trim() || name
}
