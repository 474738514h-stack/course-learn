import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import type { useAdminStore } from '../../hooks/useAdminStore'
import {
  exportActiveKnowledgeJson,
  importKnowledgeReleaseFromJson,
} from '../../services/knowledgeImport'

interface KnowledgeReleasePanelProps {
  store: ReturnType<typeof useAdminStore>
  onKnowledgeUpdated?: () => void
}

export function KnowledgeReleasePanel({
  store,
  onKnowledgeUpdated,
}: KnowledgeReleasePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setMessage(null)
    try {
      const text = await file.text()
      const release = importKnowledgeReleaseFromJson(text, file.name)
      store.refreshReleases()
      const goLive = window.confirm(
        `已导入「${release.title}」共 ${release.termCount} 条词条。\n是否立即设为线上版本？`
      )
      if (goLive) {
        store.activateRelease(release.id)
        onKnowledgeUpdated?.()
        setMessage(`已上传并设为线上：v${release.versionLabel}`)
      } else {
        setMessage(
          `上传成功：${release.title}（v${release.versionLabel}），请在列表中「设为线上」`
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败')
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([exportActiveKnowledgeJson()], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'knowledge-export-template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-notion-border bg-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-notion-text">知识库 / 词条资料</p>
          <p className="text-xs text-notion-muted mt-1 max-w-xl">
            上传 JSON（词条数组，或含 title、versionLabel、libraryIds、points
            的对象）。设为线上后，知识库与课堂命中将使用该快照。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-notion-border text-sm hover:bg-notion-hover"
          >
            <Download size={16} />
            导出当前模板
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-notion-text text-white text-sm font-medium"
          >
            <Upload size={16} />
            上传资料
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {message && (
        <p className="text-sm text-green-800 bg-green-50 px-4 py-2 rounded-lg">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-800 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <ul className="rounded-xl border bg-white divide-y">
        {store.releases.map((r) => (
          <li
            key={r.id}
            className="px-5 py-4 flex flex-wrap justify-between gap-3"
          >
            <div>
              <p className="font-medium">
                {r.title}{' '}
                <span className="text-xs font-mono text-notion-muted">
                  v{r.versionLabel}
                </span>
                {r.isActive && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    线上
                  </span>
                )}
              </p>
              <p className="text-xs text-notion-muted mt-1">
                {r.termCount} 词条 · {r.libraryIds.join('、')}
              </p>
              {r.notes && (
                <p className="text-[11px] text-notion-muted mt-1">{r.notes}</p>
              )}
            </div>
            <button
              type="button"
              disabled={r.isActive}
              onClick={() => {
                store.activateRelease(r.id)
                onKnowledgeUpdated?.()
              }}
              className="text-sm px-3 py-1.5 rounded-lg border disabled:opacity-50 h-fit"
            >
              {r.isActive ? '当前生效' : '设为线上'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
