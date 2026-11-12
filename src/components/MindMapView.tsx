import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import clsx from 'clsx'
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import type { MindMapNode } from '../types'

interface LayoutNode {
  node: MindMapNode
  path: string
  depth: number
  x: number
  y: number
  w: number
  h: number
  lines: string[]
  hasChildren: boolean
  expanded: boolean
}

const NODE_MIN_W = 88
const CHAR_W = 7.5
const LINE_H = 18
const X_STEP = 220
const X_GAP = 64
const Y_GAP = 18
const PADDING = 32

function wrapLines(label: string, maxChars: number): string[] {
  if (label.length <= maxChars) return [label]
  const lines: string[] = []
  let rest = label
  while (rest.length > maxChars) {
    let breakAt = rest.lastIndexOf(' ', maxChars)
    if (breakAt < maxChars * 0.35) breakAt = maxChars
    lines.push(rest.slice(0, breakAt).trim())
    rest = rest.slice(breakAt).trim()
  }
  if (rest) lines.push(rest)
  return lines
}

function measureNode(label: string, depth: number, fullText: boolean) {
  const maxChars = depth === 0 ? 30 : fullText ? 48 : 24
  const maxW = depth === 0 ? 320 : fullText ? 520 : 260
  const lines = wrapLines(label, maxChars)
  const longest = Math.max(...lines.map((l) => l.length), 1)
  const w = Math.min(maxW, Math.max(NODE_MIN_W, longest * CHAR_W + 32))
  const hintLines = depth > 0 ? 1 : 0
  const h = Math.max(40, (lines.length + hintLines) * LINE_H + 20)
  return { w, h, lines }
}

function layoutTree(
  root: MindMapNode,
  expanded: Set<string>,
  path = '0',
  depth = 0,
  yStart = PADDING
): { layouts: LayoutNode[]; nextY: number } {
  const isExpanded = expanded.has(path)
  const children = root.children ?? []
  const hasChildren = children.length > 0
  const showChildren = hasChildren && isExpanded
  const fullText = depth >= 2 || depth === 0 || !hasChildren
  const { w, h, lines } = measureNode(root.label, depth, fullText)

  if (!showChildren) {
    const layout: LayoutNode = {
      node: root,
      path,
      depth,
      x: depth * (X_STEP + X_GAP),
      y: yStart,
      w,
      h,
      lines,
      hasChildren,
      expanded: isExpanded,
    }
    return { layouts: [layout], nextY: yStart + h + Y_GAP }
  }

  let childY = yStart
  const childLayouts: LayoutNode[] = []

  children.forEach((child, i) => {
    const childPath = `${path}-${i}`
    const sub = layoutTree(child, expanded, childPath, depth + 1, childY)
    childLayouts.push(...sub.layouts)
    childY = sub.nextY
  })

  const totalChildHeight = Math.max(0, childY - yStart - Y_GAP)
  const selfY = yStart + Math.max(0, (totalChildHeight - h) / 2)
  const selfLayout: LayoutNode = {
    node: root,
    path,
    depth,
    x: depth * (X_STEP + X_GAP),
    y: selfY,
    w,
    h,
    lines,
    hasChildren,
    expanded: isExpanded,
  }

  return {
    layouts: [selfLayout, ...childLayouts],
    nextY: Math.max(yStart + h + Y_GAP, childY),
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

interface MindMapViewProps {
  root: MindMapNode
  defaultCollapsed?: boolean
}

export function MindMapView({ root, defaultCollapsed = true }: MindMapViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['0']))
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 24, y: 24 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const panDragRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    setExpanded(defaultCollapsed ? new Set(['0']) : new Set(['0']))
    setZoom(1)
    setPan({ x: 24, y: 24 })
  }, [root, defaultCollapsed])

  const { layouts, width, height } = useMemo(() => {
    const { layouts: ls } = layoutTree(root, expanded, '0', 0, PADDING)
    let maxX = 0
    let maxY = 0
    for (const l of ls) {
      maxX = Math.max(maxX, l.x + l.w)
      maxY = Math.max(maxY, l.y + l.h)
    }
    return {
      layouts: ls,
      width: maxX + PADDING * 2,
      height: maxY + PADDING * 2,
    }
  }, [root, expanded])

  const edges = useMemo(() => {
    const byPath = new Map(layouts.map((l) => [l.path, l]))
    const result: { x1: number; y1: number; x2: number; y2: number; idx: number }[] =
      []

    for (const l of layouts) {
      if (l.path === '0') continue
      const parentPath = l.path.replace(/-\d+$/, '')
      const parent = byPath.get(parentPath)
      if (!parent) continue
      const branchIdx = Number(l.path.split('-')[1] ?? 0)
      result.push({
        x1: parent.x + parent.w,
        y1: parent.y + parent.h / 2,
        x2: l.x,
        y2: l.y + l.h / 2,
        idx: branchIdx,
      })
    }
    return result
  }, [layouts])

  const toggleNode = useCallback((path: string, hasChildren: boolean) => {
    if (!hasChildren || path === '0') return
    setExpanded((prev) => {
      const next = new Set(prev)
      next.add('0')
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const zoomBy = useCallback((delta: number) => {
    setZoom((z) => clamp(Number((z + delta).toFixed(2)), 0.35, 2.5))
  }, [])

  const togglePageFullscreen = useCallback(() => {
    setIsFullscreen((v) => !v)
  }, [])

  useEffect(() => {
    if (!isFullscreen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isFullscreen])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.08 : 0.08
      setZoom((z) => clamp(Number((z + delta).toFixed(2)), 0.35, 2.5))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = panDragRef.current
      if (!drag) return
      setPan({
        x: drag.originX + (e.clientX - drag.startX),
        y: drag.originY + (e.clientY - drag.startY),
      })
    }
    const onUp = () => {
      if (panDragRef.current) {
        panDragRef.current = null
        setIsPanning(false)
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const onViewportMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    panDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    }
    setIsPanning(true)
  }

  const depthStyle = (layout: LayoutNode) => {
    if (layout.depth === 0) {
      return 'bg-white/90 border-slate-200 text-notion-text font-normal text-[13px] shadow-sm'
    }
    if (layout.depth === 1) {
      const palette = [
        'border-orange-300 text-orange-900 bg-orange-50',
        'border-blue-300 text-blue-900 bg-blue-50',
        'border-blue-300 text-blue-900 bg-blue-50',
        'border-blue-300 text-blue-900 bg-blue-50',
        'border-blue-300 text-blue-900 bg-blue-50',
      ]
      const idx = Number(layout.path.split('-')[1] ?? 0)
      return palette[idx] ?? palette[1]
    }
    return 'border-slate-200 text-slate-800 bg-white'
  }

  return (
    <div
      className={clsx(
        'flex flex-col',
        isFullscreen &&
          'fixed inset-0 z-[100] h-screen w-full bg-[#f7f6f3] p-4 md:p-6'
      )}
    >
      <div className="flex items-center justify-end gap-1 mb-2 shrink-0">
        <span className="text-[10px] text-notion-muted mr-auto">
          滚轮缩放 · 左键拖动画布 · 点击节点展开/收起
        </span>
        <ToolbarBtn label="缩小" onClick={() => zoomBy(-0.15)}>
          <ZoomOut size={15} />
        </ToolbarBtn>
        <span className="text-[10px] text-notion-muted w-10 text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <ToolbarBtn label="放大" onClick={() => zoomBy(0.15)}>
          <ZoomIn size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          label={isFullscreen ? '退出全屏' : '页面全屏'}
          onClick={togglePageFullscreen}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </ToolbarBtn>
      </div>

      <div
        ref={viewportRef}
        onMouseDown={onViewportMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        className={clsx(
          'relative overflow-hidden rounded-xl border border-notion-border bg-gradient-to-br from-slate-50 to-blue-50/30 select-none',
          isFullscreen ? 'flex-1 min-h-0' : 'h-[420px]',
          isPanning ? 'cursor-grabbing' : 'cursor-default'
        )}
      >
        <div
          className="absolute left-0 top-0 will-change-transform relative"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width,
            height,
          }}
        >
          <svg
            width={width}
            height={height}
            className="block overflow-visible"
            style={{ overflow: 'visible' }}
          >
            {edges.map((e, i) => (
              <path
                key={i}
                d={`M ${e.x1} ${e.y1} C ${e.x1 + 36} ${e.y1}, ${e.x2 - 36} ${e.y2}, ${e.x2} ${e.y2}`}
                fill="none"
                stroke={e.idx === 0 ? '#fdba74' : '#93c5fd'}
                strokeWidth={1.5}
              />
            ))}
          </svg>
          {layouts.map((l, z) => (
            <div
              key={l.path}
              className="absolute box-border"
              style={{
                left: l.x,
                top: l.y,
                width: l.w,
                minHeight: l.h,
                zIndex: 10 + z,
              }}
            >
              <button
                type="button"
                onClick={() => toggleNode(l.path, l.hasChildren)}
                onMouseDown={(e) => e.stopPropagation()}
                className={clsx(
                  'w-full min-h-full flex flex-col items-start justify-center rounded-lg border text-left px-3 py-2.5 text-[11px] font-medium leading-snug shadow-sm',
                  depthStyle(l),
                  l.hasChildren && l.depth > 0 && 'cursor-pointer hover:shadow-md',
                  (!l.hasChildren || l.depth === 0) && 'cursor-default'
                )}
              >
                {l.lines.map((line, li) => (
                  <span
                    key={li}
                    className="block w-full break-words whitespace-normal overflow-visible"
                  >
                    {line}
                  </span>
                ))}
                {l.hasChildren && l.depth > 0 && (
                  <span className="text-[9px] opacity-60 mt-1 shrink-0">
                    {l.expanded ? '点击收起' : '点击展开'}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ToolbarBtn({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="p-2 rounded-lg border border-notion-border bg-white text-notion-muted hover:text-notion-text hover:bg-notion-hover transition-colors"
    >
      {children}
    </button>
  )
}
