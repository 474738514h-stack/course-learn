import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  Globe,
  Upload,
  Link2,
  MonitorSpeaker,
  Loader2,
  FileAudio,
  FileVideo,
  Sparkles,
  Check,
  ClipboardList,
} from 'lucide-react'
import clsx from 'clsx'
import { KNOWLEDGE_LIBRARIES, getLibraryById } from '../data/knowledgeLibraries'
import {
  formatCourseNameWithNow,
  parseCourseLink,
  stripFileExtension,
} from '../utils/courseLinkParser'
import {
  getDefaultTeacherName,
  getTeacherPresets,
  rememberTeacherName,
} from '../data/teacherPresets'

const PAGE_SHELL = 'w-full max-w-[1280px] mx-auto px-6 md:px-10'
/** 左侧表单与右侧「开始后…」预览各占 1/2，高度随内容自适应 */
const CREATE_GRID =
  'grid lg:grid-cols-2 gap-5 lg:gap-8 items-start min-w-0'
const FORM_COL = 'min-w-0 flex flex-col gap-4 sm:gap-5'

export interface WebCoursePayload {
  sourceUrl: string
  platform: string
  courseTitle: string
  knowledgeLibraryId?: string
}

export interface UploadCoursePayload {
  file: File
  knowledgeLibraryId: string
  courseTitle: string
  teacherName: string
}

const TEACHER_CUSTOM = '__custom__'

interface NewCourseViewProps {
  onClose: () => void
  onCreateWebCourse: (payload: WebCoursePayload) => void | Promise<void>
  onCreateUploadCourse: (payload: UploadCoursePayload) => void | Promise<void>
  webCreateLoading?: boolean
  uploadCreateLoading?: boolean
}

type CreateMode = 'web' | 'upload'

export function NewCourseView({
  onClose,
  onCreateWebCourse,
  onCreateUploadCourse,
  webCreateLoading = false,
  uploadCreateLoading = false,
}: NewCourseViewProps) {
  const [mode, setMode] = useState<CreateMode>('web')
  const [courseUrl, setCourseUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [webActionError, setWebActionError] = useState<string | null>(null)
  const [platform, setPlatform] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [libraryId, setLibraryId] = useState('ai-pm')
  const [uploadTitle, setUploadTitle] = useState('')
  const [teacherChoice, setTeacherChoice] = useState(() => {
    const def = getDefaultTeacherName()
    const presets = getTeacherPresets()
    return presets.includes(def) ? def : TEACHER_CUSTOM
  })
  const [teacherCustom, setTeacherCustom] = useState(() => {
    const def = getDefaultTeacherName()
    const presets = getTeacherPresets()
    return presets.includes(def) ? '' : def
  })
  const lastAutoUrlRef = useRef('')

  const urlReady = Boolean(parseCourseLink(courseUrl))
  const activeLibrary = getLibraryById(libraryId)

  useEffect(() => {
    const trimmed = courseUrl.trim()
    if (!trimmed) {
      lastAutoUrlRef.current = ''
      setPlatform('')
      setCourseTitle('')
      setUrlError(null)
      return
    }
    const p = parseCourseLink(trimmed)
    if (!p) {
      setUrlError(null)
      return
    }
    setUrlError(null)
    if (lastAutoUrlRef.current !== trimmed) {
      lastAutoUrlRef.current = trimmed
      setPlatform(p.platform)
      setCourseTitle(formatCourseNameWithNow(p.titleHint))
    }
  }, [courseUrl])

  const handleIdentifyCourse = () => {
    const p = parseCourseLink(courseUrl)
    if (!p) {
      setUrlError('请输入有效的课程链接（需包含 http 或 https）')
      return
    }
    setUrlError(null)
    setPlatform(p.platform)
    setCourseTitle(formatCourseNameWithNow(p.titleHint))
    lastAutoUrlRef.current = courseUrl.trim()
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
    if (file) {
      setUploadTitle(stripFileExtension(file.name))
    } else {
      setUploadTitle('')
    }
  }

  const acceptMedia = 'audio/*,video/*,.mp3,.mp4,.m4a,.wav,.webm,.mov,.mkv'

  const resetWebFields = () => {
    setCourseUrl('')
    setUrlError(null)
    setPlatform('')
    setCourseTitle('')
    lastAutoUrlRef.current = ''
  }

  return (
    <div className="h-screen w-full flex flex-col min-h-0 bg-[#f7f6f3]">
      <header className="fixed top-0 left-0 right-0 z-30 h-[60px] shrink-0 border-b border-notion-border/80 bg-[#f7f6f3]/95 backdrop-blur-sm">
        <div className={`${PAGE_SHELL} h-full flex items-center gap-3`}>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-[13px] text-notion-muted hover:text-notion-text transition-colors shrink-0"
          >
            <ArrowLeft size={15} />
            返回
          </button>
          <div className="h-6 w-px bg-notion-border shrink-0" />
          <h1 className="text-[15px] font-semibold text-notion-text">新建课程</h1>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto pt-[60px]">
        <div className={`${PAGE_SHELL} py-6`}>
          <div className="rounded-2xl border border-notion-border bg-white shadow-card overflow-hidden">
            <div className="px-6 md:px-8 pt-5 pb-3 border-b border-notion-border/60">
              <div className="max-w-md mx-auto rounded-xl border border-notion-border bg-[#f7f6f3] p-1 flex gap-1">
                <ModeTab
                  active={mode === 'web'}
                  onClick={() => {
                    setMode('web')
                    resetWebFields()
                  }}
                  icon={<Globe size={16} />}
                  label="网页课程"
                />
                <ModeTab
                  active={mode === 'upload'}
                  onClick={() => setMode('upload')}
                  icon={<Upload size={16} />}
                  label="上传音视频"
                />
              </div>
            </div>

            <div className="px-6 md:px-8 py-5 lg:py-6">
              {mode === 'web' ? (
                <div className={CREATE_GRID}>
                  <div className={FORM_COL}>
                    <div className="shrink-0 space-y-1.5">
                      <p className="text-sm font-medium text-violet-600">新建网页课程</p>
                      <h2 className="text-xl md:text-2xl font-semibold text-notion-text tracking-tight leading-snug">
                        打开课程地址，把链接粘到这里
                      </h2>
                      <p className="text-sm text-notion-muted leading-relaxed max-w-xl pt-0.5">
                        粘贴链接后自动识别平台与课程名称；选择浏览器标签页共享音频即可开始实时转写。
                      </p>
                    </div>

                    <div className="shrink-0">
                      <label className="text-sm font-medium text-notion-text">
                        正在播放课程链接 <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1 min-w-0">
                          <Link2
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-notion-muted"
                          />
                          <input
                            type="url"
                            value={courseUrl}
                            onChange={(e) => {
                              setCourseUrl(e.target.value)
                              setWebActionError(null)
                            }}
                            placeholder="粘贴正在播放的课程链接"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-notion-border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleIdentifyCourse}
                          className={`${btnPrimaryMd} shrink-0 sm:min-w-[7.5rem]`}
                        >
                          识别课程
                        </button>
                      </div>
                      {urlError && (
                        <p className="text-xs text-red-600 mt-1.5">{urlError}</p>
                      )}
                      {!urlError && (
                        <p className="text-xs text-notion-muted mt-1.5 leading-relaxed">
                          支持哔哩哔哩、腾讯/优酷、智慧教育、ClassIn、钉钉等网页课程或直播回放链接。
                        </p>
                      )}
                    </div>

                    <div>
                      {urlReady ? (
                        <dl className="space-y-3 rounded-xl border border-notion-border bg-[#fafafa] px-4 py-3.5">
                          <Field label="课程所在平台">
                            <p className="text-sm font-medium text-notion-text py-0.5">
                              {platform || '—'}
                            </p>
                          </Field>
                          <Field label="课程名称">
                            <input
                              type="text"
                              value={courseTitle}
                              onChange={(e) => setCourseTitle(e.target.value)}
                              className={inputClass}
                            />
                          </Field>
                          <Field label="关联知识库">
                            <select
                              value={libraryId}
                              onChange={(e) => setLibraryId(e.target.value)}
                              className={inputClass}
                            >
                              {KNOWLEDGE_LIBRARIES.map((lib) => (
                                <option key={lib.id} value={lib.id}>
                                  {lib.fullTitle}
                                </option>
                              ))}
                            </select>
                            <p className="text-[11px] text-notion-muted mt-1.5 leading-relaxed">
                              转写将仅在本库词条中匹配高亮，便于命中如 RAG、工作流等名词。
                            </p>
                          </Field>
                        </dl>
                      ) : (
                        <WebCourseIdentifyPlaceholder />
                      )}
                    </div>

                    {webActionError && (
                      <p className="text-xs text-red-600 -mt-1">{webActionError}</p>
                    )}
                    <button
                      type="button"
                      disabled={webCreateLoading}
                      onClick={() => {
                        setWebActionError(null)
                        if (!urlReady) {
                          setUrlError('请先粘贴有效的课程链接（需包含 http 或 https）')
                          setWebActionError('请粘贴链接并点击「识别课程」后再继续')
                          return
                        }
                        if (!courseTitle.trim()) {
                          setWebActionError('请填写课程名称')
                          return
                        }
                        void onCreateWebCourse({
                          sourceUrl: courseUrl.trim(),
                          platform: platform.trim() || '网页',
                          courseTitle: courseTitle.trim(),
                          knowledgeLibraryId: libraryId,
                        })
                      }}
                      className={btnPrimaryBlock}
                    >
                      {webCreateLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <MonitorSpeaker size={18} />
                      )}
                      确认知识库并开始转写
                    </button>
                  </div>
                  <EffectPreview libraryTitle={activeLibrary?.title} />
                </div>
              ) : (
                <UploadCourseForm
                  acceptMedia={acceptMedia}
                  selectedFile={selectedFile}
                  onFileChange={handleFileChange}
                  libraryId={libraryId}
                  setLibraryId={setLibraryId}
                  uploadTitle={uploadTitle}
                  setUploadTitle={setUploadTitle}
                  uploadCreateLoading={uploadCreateLoading}
                  onCreateUploadCourse={onCreateUploadCourse}
                  libraryTitle={activeLibrary?.title}
                  teacherChoice={teacherChoice}
                  setTeacherChoice={setTeacherChoice}
                  teacherCustom={teacherCustom}
                  setTeacherCustom={setTeacherCustom}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WebCourseIdentifyPlaceholder() {
  return (
    <div className="rounded-xl border border-notion-border/70 bg-[#fafafa] px-4 py-3.5 flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
          <ClipboardList size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-notion-text">
            识别后将在此显示课程信息
          </p>
          <p className="text-xs text-notion-muted mt-1 leading-relaxed">
            粘贴正在播放的链接并点击「识别课程」，会自动填充平台与课程名称，确认后再开始转写。
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 pt-0.5">
        <div className="rounded-lg border border-notion-border/80 bg-white/80 px-3 py-2">
          <p className="text-[10px] font-medium text-notion-muted">课程所在平台</p>
          <p className="text-xs text-notion-muted/80 mt-0.5">等待识别…</p>
        </div>
        <div className="rounded-lg border border-notion-border/80 bg-white/80 px-3 py-2">
          <p className="text-[10px] font-medium text-notion-muted">课程名称</p>
          <p className="text-xs text-notion-muted/80 mt-0.5">识别后自动生成，可修改</p>
        </div>
        <div className="rounded-lg border border-notion-border/80 bg-white/80 px-3 py-2 sm:col-span-2">
          <p className="text-[10px] font-medium text-notion-muted">关联知识库</p>
          <p className="text-xs text-notion-muted/80 mt-0.5">
            识别课程后选择知识库，转写才命中库内名词
          </p>
        </div>
      </div>
    </div>
  )
}

function UploadCourseForm({
  acceptMedia,
  selectedFile,
  onFileChange,
  libraryId,
  setLibraryId,
  uploadTitle,
  setUploadTitle,
  uploadCreateLoading,
  onCreateUploadCourse,
  libraryTitle,
  teacherChoice,
  setTeacherChoice,
  teacherCustom,
  setTeacherCustom,
}: {
  acceptMedia: string
  selectedFile: File | null
  onFileChange: (f: File | null) => void
  libraryId: string
  setLibraryId: (v: string) => void
  uploadTitle: string
  setUploadTitle: (v: string) => void
  uploadCreateLoading: boolean
  onCreateUploadCourse: (p: UploadCoursePayload) => void | Promise<void>
  libraryTitle?: string
  teacherChoice: string
  setTeacherChoice: (v: string) => void
  teacherCustom: string
  setTeacherCustom: (v: string) => void
}) {
  const [uploadActionError, setUploadActionError] = useState<string | null>(null)
  const teacherPresets = getTeacherPresets()
  const resolvedTeacher =
    teacherChoice === TEACHER_CUSTOM
      ? teacherCustom.trim()
      : teacherChoice.trim()

  return (
    <div className={CREATE_GRID}>
      <div className={FORM_COL}>
        <div className="shrink-0 space-y-1.5">
          <p className="text-sm font-medium text-violet-600">上传音视频</p>
          <h2 className="text-xl md:text-2xl font-semibold text-notion-text tracking-tight leading-snug">
            选择本地文件，创建可转写课堂
          </h2>
          <p className="text-sm text-notion-muted leading-relaxed max-w-xl pt-0.5">
            进入课堂后可边播放边实时转写，并同步识别课标知识点与生成总结。
          </p>
        </div>

        <label className="flex h-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-notion-border hover:border-violet-300 hover:bg-violet-50/20 transition-colors px-4 cursor-pointer">
          <input
            type="file"
            accept={acceptMedia}
            className="sr-only"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          {selectedFile ? (
            <>
              {selectedFile.type.startsWith('video/') ? (
                <FileVideo size={28} className="text-violet-600" />
              ) : (
                <FileAudio size={28} className="text-violet-600" />
              )}
              <span className="text-sm font-medium text-notion-text truncate max-w-full px-2">
                {selectedFile.name}
              </span>
              <span className="text-xs text-notion-muted">点击更换文件</span>
            </>
          ) : (
            <>
              <Upload size={28} className="text-notion-muted" />
              <span className="text-sm text-notion-muted">点击选择音频或视频文件</span>
            </>
          )}
        </label>

        <div className="flex flex-col gap-3 sm:gap-4">
          <Field label="课程知识库">
            <select
              value={libraryId}
              onChange={(e) => setLibraryId(e.target.value)}
              className={inputClass}
            >
              {KNOWLEDGE_LIBRARIES.map((lib) => (
                <option key={lib.id} value={lib.id}>
                  {lib.fullTitle}
                </option>
              ))}
            </select>
          </Field>

          <Field label="课程名称">
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="默认使用文件名"
              className={inputClass}
            />
          </Field>

          <Field label="授课教师">
            <select
              value={teacherChoice}
              onChange={(e) => setTeacherChoice(e.target.value)}
              className={inputClass}
            >
              {teacherPresets.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
              <option value={TEACHER_CUSTOM}>其他（手动输入）</option>
            </select>
            {teacherChoice === TEACHER_CUSTOM && (
              <input
                type="text"
                value={teacherCustom}
                onChange={(e) => setTeacherCustom(e.target.value)}
                placeholder="输入教师姓名"
                className={`${inputClass} mt-1.5`}
              />
            )}
          </Field>
        </div>

        {uploadActionError && (
          <p className="text-xs text-red-600 -mt-1">{uploadActionError}</p>
        )}
        <button
          type="button"
          disabled={uploadCreateLoading}
          onClick={() => {
            setUploadActionError(null)
            if (!selectedFile) {
              setUploadActionError('请先选择音频或视频文件')
              return
            }
            if (!uploadTitle.trim()) {
              setUploadActionError('请填写课程名称')
              return
            }
            if (!resolvedTeacher) {
              setUploadActionError('请选择或填写授课教师')
              return
            }
            rememberTeacherName(resolvedTeacher)
            void onCreateUploadCourse({
              file: selectedFile,
              knowledgeLibraryId: libraryId,
              courseTitle: uploadTitle.trim(),
              teacherName: resolvedTeacher,
            })
          }}
          className={btnPrimaryBlock}
        >
          {uploadCreateLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Upload size={18} />
          )}
          创建并转写
        </button>
      </div>
      <EffectPreview libraryTitle={libraryTitle} />
    </div>
  )
}

function EffectPreview({ libraryTitle }: { libraryTitle?: string }) {
  return (
    <aside className="min-w-0 rounded-2xl border border-notion-border bg-[#fafafa] p-4 lg:p-5 flex flex-col gap-3 lg:sticky lg:top-[72px]">
      <div className="shrink-0 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-notion-text leading-snug">
            开始后，你会得到这些
          </h3>
          <p className="text-[11px] text-notion-muted mt-0.5 leading-relaxed">
            效果示意，实际内容会根据你的课程实时生成
          </p>
        </div>
        <span className="inline-flex items-center gap-1 shrink-0 text-[10px] font-medium text-violet-700 bg-violet-100 px-2 py-1 rounded-full">
          <Sparkles size={12} />
          效果预览
        </span>
      </div>

      <div className="rounded-xl border border-notion-border bg-white p-3.5 lg:p-4 space-y-3.5 shadow-sm">
        <div>
          <p className="text-xs font-semibold text-notion-muted mb-2">实时转写</p>
          <ul className="space-y-2 text-[13px] leading-relaxed">
            <li className="text-notion-muted">
              <span className="text-[10px] tabular-nums mr-2">15:58</span>
              同学们，今天我们复习一元二次方程的求根公式…
            </li>
            <li className="text-notion-text bg-violet-50/80 border-l-2 border-violet-400 pl-2 py-1 -ml-0.5 rounded-r-md">
              <span className="text-[10px] tabular-nums mr-2 text-violet-600">16:03</span>
              当判别式 b²−4ac 大于零时，方程有两个不相等的实数根。
            </li>
            <li className="text-notion-muted">
              <span className="text-[10px] tabular-nums mr-2">16:18</span>
              根与系数关系在综合题里经常和函数图像一起考…
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-notion-muted mb-2">识别的知识点</p>
          <div className="flex flex-wrap gap-1.5">
            {['RAG', '工作流', 'Prompt', 'Agent'].map((t) => (
              <span
                key={t}
                className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100"
              >
                {t}
              </span>
            ))}
          </div>
          {libraryTitle && (
            <p className="text-[10px] text-notion-muted mt-2">知识库：{libraryTitle}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-notion-muted mb-2">笔记与总结</p>
          <p className="text-xs font-medium text-notion-text mb-2">本节课核心内容</p>
          <ul className="space-y-1.5 text-[12px] text-notion-muted">
            {[
              '掌握求根公式与判别式的对应关系',
              '会用根与系数关系快速验算',
              '对照转写生成思维导图与行动项',
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-violet-600 text-white shadow-sm'
          : 'text-notion-muted hover:text-notion-text hover:bg-white/80'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <span className="text-xs font-medium text-notion-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-notion-border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400'

/** 主操作按钮：黑色实心，全页统一 */
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-notion-text text-white text-sm font-semibold shadow-sm hover:bg-notion-text/90 active:bg-notion-text/95 disabled:opacity-40 disabled:pointer-events-none transition-colors'
const btnPrimaryMd = `${btnPrimary} px-5 py-3`
const btnPrimaryBlock = `${btnPrimaryMd} w-full shrink-0`
