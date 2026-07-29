export type UserRole = 'STUDENT' | 'ADMIN'
export type LessonLevel = 'A1' | 'A2' | 'B1' | 'B2'
export type LessonTopic = 'VOCABULARY' | 'GRAMMAR' | 'LISTENING' | 'READING'
export type SectionType = 'TEXT' | 'VOCABULARY' | 'GRAMMAR' | 'VIDEO' | 'MINI_QUIZ' | 'EXERCISE'
export type FlashcardRating = 'De' | 'Kho' | 'Lam_lai'

// JSON structures cho lesson_sections.noi_dung
export type TextSectionContent = { content: string }
export type VocabularySectionContent = {
  title: string
  words: Array<{ tuPhap: string; phatAm: string; nghiaViet: string; audioUrl: string | null }>
}
export type GrammarSectionContent = {
  title: string
  giaiThich: string
  viDuPhap: string
  viDuCau: string
  dichNghia: string
}
export type MiniQuizContent = {
  questions?: Array<{
    cauHoi: string
    luaChon: Array<{ kyHieu: string; noiDung: string }>
    dapAnDung: string
  }>
  // Legacy support
  cauHoi?: string
  luaChon?: Array<{ kyHieu: string; noiDung: string }>
  dapAnDung?: string
}
