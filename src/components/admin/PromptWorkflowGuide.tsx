import type { ReactNode } from 'react'
import clsx from 'clsx'
import {
  ClipboardCheck,
  Pencil,
  RotateCcw,
  Save,
  Sparkles,
  Upload,
} from 'lucide-react'
import type { PromptTemplate } from '../../types/admin'

type WorkflowStep = 'edit' | 'save' | 'eval' | 'publish' | 'rollback'

const STEPS: {
  id: WorkflowStep
  title: string
  short: string
  icon: ReactNode
}[] = [
  {
    id: 'edit',
    title: '1. 编辑',
    short: '改 Prompt 文案，不会动线上',
    icon: <Pencil size={18} />,
  },
  {
    id: 'save',
    title: '2. 保存',
    short: '生成新草稿版本号 + 自动测评',
    icon: <Save size={18} />,
  },
  {
    id: 'eval',
    title: '3. 看评分',
    short: '确认测评通过再发布',
    icon: <ClipboardCheck size={18} />,
  },
  {
    id: 'publish',
    title: '4. 发布',
    short: '仅此步后前台用户才生效',
    icon: <Upload size={18} />,
  },
  {
    id: 'rollback',
    title: '5. 回滚（可选）',
    short: '恢复上一版线上 Prompt',
    icon: <RotateCcw size={18} />,
  },
]

function activeStepFor(
  selected: PromptTemplate | null,
  dirty: boolean,
  saving: boolean
): WorkflowStep {
  if (saving) return 'save'
  if (!selected) return 'edit'
  if (dirty) return 'edit'
  if (selected.status === 'draft') {
    if (selected.testRunAt) return 'publish'
    return 'eval'
  }
  if (selected.status === 'published') return 'edit'
  return 'rollback'
}

function stepState(
  step: WorkflowStep,
  active: WorkflowStep,
  selected: PromptTemplate | null,
  dirty: boolean
): 'done' | 'current' | 'upcoming' {
  const order: WorkflowStep[] = [
    'edit',
    'save',
    'eval',
    'publish',
    'rollback',
  ]
  const ai = order.indexOf(active)
  const si = order.indexOf(step)
  if (si < ai) return 'done'
  if (si === ai) return 'current'
  if (step === 'rollback' && selected?.status === 'published') {
    return 'upcoming'
  }
  if (step === 'edit' && dirty) return 'current'
  return 'upcoming'
}

interface PromptWorkflowGuideProps {
  selected: PromptTemplate | null
  dirty: boolean
  saving: boolean
  canRollback: boolean
}

export function PromptWorkflowGuide({
  selected,
  dirty,
  saving,
  canRollback,
}: PromptWorkflowGuideProps) {
  const active = activeStepFor(selected, dirty, saving)

  return (
    <section className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-5 mb-4">
      <div className="flex items-start gap-2 mb-4">
        <Sparkles size={20} className="text-violet-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-semibold text-notion-text">
            Prompt 变更标准流程（请按顺序操作）
          </h2>
          <p className="text-xs text-notion-muted mt-1 leading-relaxed max-w-3xl">
            前台用户看不到版本号与模型参数。仅「发布」后的 Prompt
            会对划词解释、本课总结等生效；只点保存不会改用户侧行为。
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-1">
        {STEPS.map((step, index) => {
          const state = stepState(step.id, active, selected, dirty)
          const dimRollback = step.id === 'rollback' && !canRollback
          return (
            <li key={step.id} className="relative flex md:flex-col items-start gap-2 md:gap-0">
              {index > 0 && (
                <span
                  className="hidden md:block absolute -left-2 top-5 w-4 border-t border-violet-200"
                  aria-hidden
                />
              )}
              <div
                className={clsx(
                  'flex md:flex-col items-center md:text-center gap-2 md:gap-1.5 w-full rounded-lg px-2 py-2 md:py-3 border transition-colors',
                  state === 'current' &&
                    'border-violet-500 bg-white shadow-sm ring-1 ring-violet-200',
                  state === 'done' && 'border-green-200 bg-green-50/50',
                  state === 'upcoming' &&
                    !dimRollback &&
                    'border-notion-border/80 bg-white/60',
                  dimRollback && 'border-notion-border/60 opacity-50'
                )}
              >
                <span
                  className={clsx(
                    'shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
                    state === 'current' && 'bg-violet-600 text-white',
                    state === 'done' && 'bg-green-600 text-white',
                    state === 'upcoming' && 'bg-notion-sidebar text-notion-muted'
                  )}
                >
                  {step.icon}
                </span>
                <div className="min-w-0 md:px-1">
                  <p className="text-xs font-semibold text-notion-text">
                    {step.title}
                  </p>
                  <p className="text-[11px] text-notion-muted leading-snug mt-0.5">
                    {step.short}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 grid md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-white/80 border border-notion-border px-3 py-2.5">
          <p className="font-medium text-green-800 mb-1">可以放心做</p>
          <ul className="text-notion-muted space-y-1 list-disc list-inside">
            <li>在「线上」版本上改字后点保存 → 只会多出草稿，用户无感</li>
            <li>多看测评分数，不满意就继续改草稿再保存</li>
            <li>出问题用「回滚上一版」恢复上一版线上 Prompt</li>
          </ul>
        </div>
        <div className="rounded-lg bg-white/80 border border-notion-border px-3 py-2.5">
          <p className="font-medium text-amber-900 mb-1">注意</p>
          <ul className="text-notion-muted space-y-1 list-disc list-inside">
            <li>未发布的草稿不会进入前台</li>
            <li>「发布」会立刻切换全部相关 AI 能力，请先确认评分</li>
            <li>配置中心里手动改映射，也应选「线上」状态的版本</li>
          </ul>
        </div>
      </div>

      {selected && (
        <p className="mt-3 text-[11px] text-violet-800/90 font-mono">
          当前选中：v{selected.versionLabel} ·{' '}
          {selected.status === 'published'
            ? '线上（改内容请保存为新草稿）'
            : selected.status === 'draft'
              ? selected.testScore != null
                ? `草稿 · 测评 ${selected.testScore} 分 · 可发布`
                : '草稿 · 待查看测评或重新保存'
              : '已归档（仅供查看）'}
        </p>
      )}
    </section>
  )
}
