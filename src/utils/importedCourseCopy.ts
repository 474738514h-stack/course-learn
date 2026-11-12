/** 展示用：去掉历史导入文案中的第三方产品名 */
export function stripVendorNameFromCopy(text: string | undefined): string {
  if (!text) return ''
  return text
    .replace(/课伴复盘导入/g, '复盘导入')
    .replace(/课伴/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function isReviewMarkdownImport(course: {
  description?: string
  lessons: { summary?: { importedFromKeban?: boolean; fullMarkdown?: string } }[]
}): boolean {
  const lesson = course.lessons[0]
  return (
    Boolean(lesson?.summary?.importedFromKeban) ||
    course.description?.includes('复盘导入') === true ||
    course.description?.includes('课伴复盘导入') === true ||
    Boolean(lesson?.summary?.fullMarkdown?.includes('## 课程重点'))
  )
}
