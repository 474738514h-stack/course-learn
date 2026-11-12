import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { CheckCircle2, Loader2, RotateCcw, Save, Upload } from 'lucide-react'
import type { KnowledgePoint } from '../../types'
import type { PromptScene, PromptTemplate } from '../../types/admin'
import type { useAdminStore } from '../../hooks/useAdminStore'
import { PromptWorkflowGuide } from './PromptWorkflowGuide'

const SCENE_LABEL: Record<PromptScene, string> = {
  explain: '划词 / 问答',
  lesson_summary: '本课总结',
}

const STATUS_LABEL: Record<PromptTemplate['status'], string> = {
  draft: '草稿',
  published: '线上',
  archived: '已归档',
}

type EditorDraft = Pick<
  PromptTemplate,
  'name' | 'versionLabel' | 'systemPrompt' | 'userPromptTemplate' | 'notes'
>

interface PromptVersionsPanelProps {
  knowledgePoints: KnowledgePoint[]
  store: ReturnType<typeof useAdminStore>
}

export function PromptVersionsPanel({
  knowledgePoints,
  store,
}: PromptVersionsPanelProps) {
  const [selectedId, setSelectedId] = useState(() => store.prompts[0]?.id ?? '')
  const [draft, setDraft] = useState<EditorDraft | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...store.prompts].sort((a, b) => b.updatedAt - a.updatedAt),
    [store.prompts]
  )

  const selected = useMemo(
    () => store.prompts.find((p) => p.id === selectedId) ?? null,
    [store.prompts, selectedId]
  )

  const loadDraftFrom = useCallback((p: PromptTemplate) => {
    setDraft({
      name: p.name,
      versionLabel: p.versionLabel,
      systemPrompt: p.systemPrompt,
      userPromptTemplate: p.userPromptTemplate,
      notes: p.notes,
    })
    setDirty(false)
  }, [])

  useEffect(() => {
    if (selected) loadDraftFrom(selected)
    else setDraft(null)
  }, [selected, loadDraftFrom])

  const canRollback = useMemo(() => {
    if (!selected) return false
    return store.prompts.some(
      (p) => p.scene === selected.scene && p.status === 'archived'
    )
  }, [selected, store.prompts])

  const handleSave = async () => {
    if (!selected || !draft) return
    setSaving(true)
    setToast(null)
    try {
      const created = await store.saveNewVersion(selected, draft, knowledgePoints)
      setSelectedId(created.id)
      setToast(
        created.testScore != null
          ? `保存成功 · 已生成 v${created.versionLabel} · 测评 ${created.testScore} 分（${created.testMessage}）`
          : `保存成功 · 已生成 v${created.versionLabel}`
      )
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = () => {
    if (!selected || selected.status !== 'draft') return
    const ok = window.confirm(
      '发布后前台将立即使用该版本，是否继续？'
    )
    if (!ok) return
    const pub = store.publishVersion(selected.id)
    if (pub) {
      setToast(`已发布 v${pub.versionLabel}，前台已切换`)
      loadDraftFrom(pub)
    }
  }

  const handleRollback = () => {
    if (!selected) return
    const prev = store.rollbackScene(selected.scene)
    if (prev) {
      setSelectedId(prev.id)
      setToast(`已回滚至 v${prev.versionLabel}`)
    } else {
      setToast('没有可回滚的上一版')
    }
  }

  return (
    <div className="space-y-4">
      <PromptWorkflowGuide
        selected={selected}
        dirty={dirty}
        saving={saving}
        canRollback={canRollback}
      />
      <div className="grid lg:grid-cols-[280px_1fr] gap-4 min-h-[480px]">
      <div className="rounded-xl border bg-white p-3 flex flex-col">
        <ul className="flex-1 overflow-y-auto space-y-1">
          {sorted.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg text-sm',
                  selectedId === p.id
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-notion-hover'
                )}
              >
                <span className="font-medium">{p.name}</span>
                <span className="block text-[11px] text-notion-muted font-mono">
                  v{p.versionLabel} · {SCENE_LABEL[p.scene]} ·{' '}
                  {STATUS_LABEL[p.status]}
                  {p.testScore != null && ` · ${p.testScore}分`}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
          {(['explain', 'lesson_summary'] as const).map((scene) => (
            <button
              key={scene}
              type="button"
              className="text-xs px-2 py-1 border rounded"
              onClick={() => {
                const id = store.addPrompt(scene)
                setSelectedId(id)
              }}
            >
              + {SCENE_LABEL[scene]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 flex flex-col min-h-0">
        {!selected || !draft ? (
          <p className="text-sm text-notion-muted">选择或新建 Prompt 版本</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={clsx(
                  'text-xs px-2 py-0.5 rounded-full',
                  selected.status === 'published' && 'bg-green-100 text-green-800',
                  selected.status === 'draft' && 'bg-amber-100 text-amber-900',
                  selected.status === 'archived' && 'bg-gray-100 text-gray-600'
                )}
              >
                {STATUS_LABEL[selected.status]}
              </span>
              {dirty && (
                <span className="text-xs text-amber-700">有未保存修改</span>
              )}
              <div className="flex-1" />
              <button
                type="button"
                disabled={saving || !dirty}
                onClick={() => void handleSave()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-notion-text text-white text-sm disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                ② 保存
              </button>
              <button
                type="button"
                disabled={selected.status !== 'draft'}
                onClick={handlePublish}
                title="仅发布后前台 AI 才使用此版本"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-600 text-violet-700 text-sm disabled:opacity-40"
              >
                <Upload size={14} />
                ④ 发布
              </button>
              <button
                type="button"
                disabled={!canRollback}
                onClick={handleRollback}
                title="恢复本场景上一版线上 Prompt"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
              >
                <RotateCcw size={14} />
                ⑤ 回滚
              </button>
            </div>

            {toast && (
              <div className="mb-4 text-sm px-3 py-2 rounded-lg bg-green-50 text-green-900 flex gap-2 items-start">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                {toast}
              </div>
            )}

            {selected.testScore != null && (
              <p className="text-xs text-notion-muted mb-3">
                最近测评：{selected.testScore} 分 · {selected.testMessage} ·{' '}
                {selected.testRunAt
                  ? new Date(selected.testRunAt).toLocaleString('zh-CN')
                  : ''}
              </p>
            )}

            <div className="space-y-4 flex-1 overflow-y-auto max-w-3xl">
              <input
                className="text-lg font-semibold w-full border-b outline-none"
                value={draft.name}
                onChange={(e) => {
                  setDraft({ ...draft, name: e.target.value })
                  setDirty(true)
                }}
              />
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono bg-[#fafafa]"
                readOnly
                value={`下一保存将基于当前版本号递增（当前 v${selected.versionLabel}）`}
              />
              <textarea
                className="w-full min-h-[220px] border rounded-lg px-3 py-2 text-sm font-mono"
                value={draft.systemPrompt}
                onChange={(e) => {
                  setDraft({ ...draft, systemPrompt: e.target.value })
                  setDirty(true)
                }}
              />
              {selected.scene === 'explain' && (
                <textarea
                  className="w-full min-h-[72px] border rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="{{text}} {{contextBlock}}"
                  value={draft.userPromptTemplate ?? ''}
                  onChange={(e) => {
                    setDraft({
                      ...draft,
                      userPromptTemplate: e.target.value,
                    })
                    setDirty(true)
                  }}
                />
              )}
              {selected.status !== 'published' && (
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => {
                    if (window.confirm('删除此版本？')) {
                      store.removePrompt(selected.id)
                      setSelectedId(store.prompts[0]?.id ?? '')
                    }
                  }}
                >
                  删除此版本
                </button>
              )}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  )
}
