import {
  Mic,
  Monitor,
  Brain,
  Radio,
  AudioLines,
  Globe,
  GraduationCap,
  Library,
  BarChart3,
  Settings2,
} from 'lucide-react'
import clsx from 'clsx'
import type { SidebarNav } from '../types/sidebar'

export type { SidebarNav }

interface SidebarProps {
  nav: SidebarNav
  onNavChange: (nav: SidebarNav) => void
}

export function Sidebar({ nav, onNavChange }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-notion-border bg-notion-sidebar flex flex-col h-full">
      <div className="p-4 border-b border-notion-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Brain className="text-white" size={18} />
          </div>
          <div>
            <h1 className="font-semibold text-notion-text text-sm tracking-tight">
              AI学霸
            </h1>
            <p className="text-[11px] text-notion-muted">实时转写+名词解释</p>
          </div>
        </div>
      </div>

      <nav className="p-2 space-y-0.5">
        <NavItem
          icon={<BarChart3 size={16} />}
          label="学习统计"
          active={nav === 'stats'}
          onClick={() => onNavChange('stats')}
        />
        <NavItem
          icon={<GraduationCap size={16} />}
          label="课程"
          active={nav === 'courses'}
          onClick={() => onNavChange('courses')}
        />
        <NavItem
          icon={<Library size={16} />}
          label="知识库"
          active={nav === 'knowledge'}
          onClick={() => onNavChange('knowledge')}
        />
      </nav>

      <div className="flex-1 min-h-0" aria-hidden />

      <div className="shrink-0 p-2 border-t border-notion-border">
        <NavItem
          icon={<Settings2 size={16} />}
          label="运营配置"
          active={nav === 'admin'}
          onClick={() => onNavChange('admin')}
        />
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors text-left',
        active
          ? 'bg-notion-hover text-notion-text'
          : 'text-notion-muted hover:bg-notion-hover/60 hover:text-notion-text'
      )}
    >
      <span className={active ? 'text-blue-600' : 'text-notion-muted'}>{icon}</span>
      {label}
    </button>
  )
}

export function AudioSourceToggle({
  source,
  onChange,
}: {
  source: 'microphone' | 'tab'
  onChange: (source: 'microphone' | 'tab') => void
}) {
  return (
    <div className="flex items-center bg-notion-sidebar rounded-lg p-0.5 border border-notion-border">
      <button
        onClick={() => onChange('microphone')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
          source === 'microphone'
            ? 'bg-white shadow-sm text-notion-text'
            : 'text-notion-muted hover:text-notion-text'
        )}
      >
        <Mic size={13} />
        麦克风
      </button>
      <button
        onClick={() => onChange('tab')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
          source === 'tab'
            ? 'bg-white shadow-sm text-notion-text'
            : 'text-notion-muted hover:text-notion-text'
        )}
      >
        <Monitor size={13} />
        标签页
      </button>
    </div>
  )
}

export function TranscriptionEngineToggle({
  engine,
  onChange,
}: {
  engine: 'browser' | 'tingwu'
  onChange: (engine: 'browser' | 'tingwu') => void
}) {
  return (
    <div className="flex items-center bg-notion-sidebar rounded-lg p-0.5 border border-notion-border">
      <button
        onClick={() => onChange('tingwu')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
          engine === 'tingwu'
            ? 'bg-white shadow-sm text-notion-text'
            : 'text-notion-muted hover:text-notion-text'
        )}
      >
        <AudioLines size={13} />
        通义听悟
      </button>
      <button
        onClick={() => onChange('browser')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
          engine === 'browser'
            ? 'bg-white shadow-sm text-notion-text'
            : 'text-notion-muted hover:text-notion-text'
        )}
      >
        <Globe size={13} />
        浏览器
      </button>
    </div>
  )
}

export function ListeningIndicator({
  isListening,
  engine,
}: {
  isListening: boolean
  engine: 'browser' | 'tingwu'
}) {
  if (!isListening) return null

  return (
    <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
      <Radio size={14} className="animate-pulse" />
      {engine === 'tingwu' ? '听悟转写中…' : '正在聆听…'}
    </div>
  )
}
