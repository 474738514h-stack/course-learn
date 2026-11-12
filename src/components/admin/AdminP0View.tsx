import { useState } from 'react'
import clsx from 'clsx'
import {
  GitBranch,
  Library,
  RotateCcw,
  Sparkles,
  SpellCheck,
} from 'lucide-react'
import { KnowledgeReleasePanel } from './KnowledgeReleasePanel'
import { PromptVersionsPanel } from './PromptVersionsPanel'
import { TASK_LABELS, useAdminStore } from '../../hooks/useAdminStore'
import { llmProviderLabel } from '../../services/llm'
import type { KnowledgePoint } from '../../types'
import type { AITask, PromptScene, PromptTemplate } from '../../types/admin'

type Tab = 'routing' | 'prompts' | 'knowledge' | 'corrections'

function promptsForTask(task: AITask, prompts: PromptTemplate[]) {
  const scene: PromptScene =
    task === 'lesson_summary' ? 'lesson_summary' : 'explain'
  return prompts.filter(
    (p) => p.scene === scene && p.status === 'published'
  )
}

interface AdminP0ViewProps {
  knowledgePoints: KnowledgePoint[]
  onKnowledgeUpdated?: () => void
}

export function AdminP0View({
  knowledgePoints,
  onKnowledgeUpdated,
}: AdminP0ViewProps) {
  const [tab, setTab] = useState<Tab>('routing')
  const store = useAdminStore()
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f7f6f3]">
      <header className="shrink-0 px-8 pt-8 pb-4">
        <div className="rounded-2xl border border-notion-border bg-white px-8 py-7 shadow-card">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-notion-text">
                运营配置（P0）
              </h1>
              <p className="text-sm text-notion-muted mt-2 max-w-2xl leading-relaxed">
                Prompt 变更请打开「Prompt 版本」按五步流程操作；知识库、ASR
                纠正保存即生效。应用版本 v{__APP_VERSION__}；部署：
                {llmProviderLabel()}。
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('恢复 P0 默认配置？')) store.resetDefaults()
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-notion-border text-sm text-notion-muted hover:bg-notion-hover"
            >
              <RotateCcw size={16} />
              恢复默认
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {(
              [
                ['routing', '配置中心', GitBranch],
                ['prompts', 'Prompt 版本', Sparkles],
                ['knowledge', '知识库发布', Library],
                ['corrections', 'ASR 纠正', SpellCheck],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                  tab === id
                    ? 'bg-notion-text text-white'
                    : 'bg-white border border-notion-border text-notion-muted'
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 px-8 pb-8 overflow-y-auto">
        {tab === 'routing' && (
          <div className="space-y-6">
            <p className="text-xs text-notion-muted px-1">
              此处映射的 Prompt 须为「Prompt 版本」里已发布的线上版本；改 Prompt 请走
              编辑 → 保存 → 测评 → 发布 流程。
            </p>
            <section className="rounded-xl border border-notion-border bg-white p-5">
              <h2 className="text-sm font-semibold mb-3">任务 → Prompt / 模型</h2>
              <table className="w-full text-sm">
                <thead className="text-left text-notion-muted border-b">
                  <tr>
                    <th className="py-2">任务</th>
                    <th className="py-2">Prompt 版本</th>
                    <th className="py-2">模型路由</th>
                    <th className="py-2">启用</th>
                  </tr>
                </thead>
                <tbody>
                  {store.mappings.map((m) => (
                    <tr key={m.id} className="border-b border-notion-border/60">
                      <td className="py-3">{TASK_LABELS[m.task]}</td>
                      <td className="py-3">
                        <select
                          className="border rounded-lg px-2 py-1.5 min-w-[180px]"
                          value={m.promptVersionId}
                          onChange={(e) =>
                            store.updateMapping(m.id, {
                              promptVersionId: e.target.value,
                            })
                          }
                        >
                          {promptsForTask(m.task, store.prompts).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} · v{p.versionLabel}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <select
                          className="border rounded-lg px-2 py-1.5"
                          value={m.modelRouteId}
                          onChange={(e) =>
                            store.updateMapping(m.id, {
                              modelRouteId: e.target.value,
                            })
                          }
                        >
                          {store.routes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={m.enabled}
                          onChange={(e) =>
                            store.updateMapping(m.id, {
                              enabled: e.target.checked,
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="rounded-xl border border-notion-border bg-white p-5">
              <h2 className="text-sm font-semibold mb-3">模型路由</h2>
              <div className="space-y-3">
                {store.routes.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg bg-[#fafafa] border"
                  >
                    <input
                      className="border rounded px-2 py-1 text-sm"
                      value={r.name}
                      onChange={(e) =>
                        store.updateRoute(r.id, { name: e.target.value })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1 text-sm font-mono"
                      value={r.model}
                      onChange={(e) =>
                        store.updateRoute(r.id, { model: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      step={0.1}
                      className="border rounded px-2 py-1 text-sm"
                      value={r.temperature}
                      onChange={(e) =>
                        store.updateRoute(r.id, {
                          temperature: Number(e.target.value),
                        })
                      }
                    />
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={r.enabled}
                        onChange={(e) =>
                          store.updateRoute(r.id, { enabled: e.target.checked })
                        }
                      />
                      启用
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'prompts' && (
          <PromptVersionsPanel
            knowledgePoints={knowledgePoints}
            store={store}
          />
        )}

        {tab === 'knowledge' && (
          <KnowledgeReleasePanel
            store={store}
            onKnowledgeUpdated={onKnowledgeUpdated}
          />
        )}

        {tab === 'corrections' && (
          <div className="rounded-xl border bg-white overflow-x-auto">
            <div className="px-4 py-3 border-b flex justify-between">
              <p className="text-sm text-notion-muted">
                转写入库前替换；全局或按学科库生效
              </p>
              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded-lg bg-notion-text text-white"
                onClick={() => store.addCorrection()}
              >
                新增
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#fafafa] text-notion-muted text-left">
                <tr>
                  <th className="px-4 py-2">误写</th>
                  <th className="px-4 py-2">纠正为</th>
                  <th className="px-4 py-2">范围</th>
                  <th className="px-4 py-2">启用</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {store.corrections.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-2">
                      <input
                        className="border rounded px-2 py-1 w-full min-w-[100px]"
                        value={row.wrong}
                        onChange={(e) =>
                          store.updateCorrection(row.id, {
                            wrong: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="border rounded px-2 py-1 w-full min-w-[100px]"
                        value={row.correct}
                        onChange={(e) =>
                          store.updateCorrection(row.id, {
                            correct: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        className="border rounded px-2 py-1"
                        value={row.scope}
                        onChange={(e) =>
                          store.updateCorrection(row.id, {
                            scope: e.target.value as typeof row.scope,
                          })
                        }
                      >
                        <option value="global">全局</option>
                        <option value="ai-pm">AI 产品</option>
                        <option value="ai-eng">AI 工程</option>
                        <option value="ai-growth">AI 增长</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(e) =>
                          store.updateCorrection(row.id, {
                            enabled: e.target.checked,
                          })
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="text-xs text-red-600"
                        onClick={() => store.removeCorrection(row.id)}
                      >
                        删
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
