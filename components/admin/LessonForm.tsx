'use client'

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

export interface LessonFormHandle {
  submit: (isPublish: boolean) => Promise<void>
  handleDelete: () => Promise<void>
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = 'TEXT' | 'VOCABULARY' | 'GRAMMAR' | 'VIDEO' | 'MINI_QUIZ'

interface WordRow { tuPhap: string; phatAm: string; nghiaViet: string; viDu: string }
interface QuizChoice { kyHieu: string; noiDung: string }

interface TextData { content: string }
interface VocabData { title: string; words: WordRow[] }
interface GrammarData { title: string; giaiThich: string; viDuPhap: string; viDuCau: string; dichNghia: string }
interface VideoData { youtubeUrl: string; youtubeId?: string }
interface QuizQuestion { cauHoi: string; luaChon: QuizChoice[]; dapAnDung: string }
interface QuizData { questions?: QuizQuestion[]; cauHoi?: string; luaChon?: QuizChoice[]; dapAnDung?: string }

type SectionData = TextData | VocabData | GrammarData | VideoData | QuizData

interface Section { loai: SectionType; data: SectionData; thuTu: number }

interface LessonFormProps {
  lessonId?: string
  defaultValues?: {
    tieuDe: string; moTa?: string; level: string; chuDe: string
    anhBia: string; thoiGianDoc: number; isPublish: boolean; sections: Section[]
  }
}

// ─── Default data per type ────────────────────────────────────────────────────

function defaultData(loai: SectionType): SectionData {
  if (loai === 'TEXT') return { content: '' }
  if (loai === 'VOCABULARY') return { title: 'Từ vựng chính', words: [{ tuPhap: '', phatAm: '', nghiaViet: '', viDu: '' }] }
  if (loai === 'GRAMMAR') return { title: 'Ngữ pháp', giaiThich: '', viDuPhap: '', viDuCau: '', dichNghia: '' }
  if (loai === 'VIDEO') return { youtubeUrl: '' }
  return { questions: [{ cauHoi: '', luaChon: [{ kyHieu: 'A', noiDung: '' }, { kyHieu: 'B', noiDung: '' }, { kyHieu: 'C', noiDung: '' }, { kyHieu: 'D', noiDung: '' }], dapAnDung: 'A' }] }
}

const SECTION_LABELS: Record<SectionType, string> = {
  TEXT: 'Văn bản', VOCABULARY: 'Từ vựng', GRAMMAR: 'Ngữ pháp', VIDEO: 'Video', MINI_QUIZ: 'Mini Quiz'
}
const BLOCK_TYPES: { type: SectionType; label: string; icon: string }[] = [
  { type: 'TEXT', label: 'Văn bản', icon: '📄' },
  { type: 'VOCABULARY', label: 'Từ vựng', icon: '📚' },
  { type: 'GRAMMAR', label: 'Ngữ pháp', icon: '✏️' },
  { type: 'VIDEO', label: 'Video', icon: '🎬' },
  { type: 'MINI_QUIZ', label: 'Mini Quiz', icon: '❓' },
]

const INPUT = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30'

// ─── Block editors ────────────────────────────────────────────────────────────

function TextEditor({ data, onChange }: { data: TextData; onChange: (d: TextData) => void }) {
  return (
    <textarea
      rows={4}
      value={data.content}
      onChange={e => onChange({ content: e.target.value })}
      placeholder="Nhập nội dung văn bản cho phần này"
      className={INPUT + ' resize-y'}
    />
  )
}

function VocabEditor({ data, onChange }: { data: VocabData; onChange: (d: VocabData) => void }) {
  const addWord = () => onChange({ ...data, words: [...data.words, { tuPhap: '', phatAm: '', nghiaViet: '', viDu: '' }] })
  const removeWord = (i: number) => onChange({ ...data, words: data.words.filter((_, idx) => idx !== i) })
  const updateWord = (i: number, key: keyof WordRow, val: string) => {
    const words = data.words.map((w, idx) => idx === i ? { ...w, [key]: val } : w)
    onChange({ ...data, words })
  }
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-black">
              <th className="pb-2 pr-2 text-left font-medium">Tiếng Pháp</th>
              <th className="pb-2 pr-2 text-left font-medium">IPA</th>
              <th className="pb-2 pr-2 text-left font-medium">Tiếng Việt</th>
              <th className="pb-2 pr-2 text-left font-medium">Ví dụ</th>
              <th className="pb-2 text-left font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.words.map((w, i) => (
              <tr key={i} className="border-b border-gray-50">
                {(['tuPhap', 'phatAm', 'nghiaViet', 'viDu'] as const).map(k => (
                  <td key={k} className="py-1.5 pr-2">
                    <input value={w[k]} onChange={e => updateWord(i, k, e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-primary" placeholder={k === 'tuPhap' ? 'Bonjour' : k === 'phatAm' ? '/bɔ̃ʒuʁ/' : k === 'nghiaViet' ? 'Xin chào' : 'Ví dụ...'} />
                  </td>
                ))}
                <td className="py-1.5">
                  <button type="button" onClick={() => removeWord(i)} className="text-black hover:opacity-70 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" fill="currentColor" width="14" height="18">
                      <path fillRule="evenodd" clipRule="evenodd" d="M5 1h4v1H5z M1 3h12v1H1z M2 5v12h10V5H2z M3 6h8v10H3V6z M5 8h1v6H5V8z M8 8h1v6H8V8z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addWord} className="mt-2 text-xs font-medium text-primary hover:underline">+ Thêm từ mới</button>
    </div>
  )
}

function GrammarEditor({ data, onChange }: { data: GrammarData; onChange: (d: GrammarData) => void }) {
  const fields: { key: keyof GrammarData; label: string; placeholder: string }[] = [
    { key: 'giaiThich', label: 'Giải thích', placeholder: 'Giải thích ngữ pháp...' },
    { key: 'viDuPhap', label: 'Ví dụ cú pháp', placeholder: 'Comment allez-vous ?' },
    { key: 'viDuCau', label: 'Ví dụ câu', placeholder: '"Bonjour! Comment allez-vous?"' },
    { key: 'dichNghia', label: 'Dịch nghĩa', placeholder: '"Xin chào! Bạn có khỏe không?"' },
  ]
  return (
    <div className="flex flex-col gap-2">
      {fields.map(f => (
        <div key={f.key}>
          <label className="mb-1 block text-xs font-medium text-black">{f.label}</label>
          <input value={data[f.key]} onChange={e => onChange({ ...data, [f.key]: e.target.value })} className={INPUT} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  )
}

function VideoEditor({ data, onChange }: { data: VideoData; onChange: (d: VideoData) => void }) {
  const getYoutubeId = (url: string) => {
    const m = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/)
    return m ? m[1] : null
  }
  const ytId = getYoutubeId(data.youtubeUrl || '')
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-black">URL YouTube</label>
      <div className="flex gap-2">
        <input value={data.youtubeUrl || ''} onChange={e => {
          const ytId = getYoutubeId(e.target.value)
          onChange({ youtubeUrl: e.target.value, youtubeId: ytId || undefined })
        }} className={INPUT} placeholder="https://youtube.com/watch?v=..." />
        <button type="button" className="shrink-0 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors">Đổi URL</button>
      </div>
      {ytId && (
        <div className="mt-3 overflow-hidden rounded-lg">
          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="YouTube thumbnail" className="w-full max-w-xs rounded-lg" />
        </div>
      )}
    </div>
  )
}

function QuizEditor({ data, onChange }: { data: QuizData; onChange: (d: QuizData) => void }) {
  // Migration for legacy data
  const rawQuestions = data.questions || [{
    cauHoi: data.cauHoi || (data as any).cau_hoi || '',
    luaChon: data.luaChon || (data as any).lua_chon || [
      { kyHieu: 'A', noiDung: '' },
      { kyHieu: 'B', noiDung: '' },
      { kyHieu: 'C', noiDung: '' },
      { kyHieu: 'D', noiDung: '' },
    ],
    dapAnDung: data.dapAnDung || (data as any).dap_an_dung || 'A',
  }]

  const questions = rawQuestions.map((q: any) => ({
    cauHoi: q.cauHoi || q.cau_hoi || '',
    luaChon: (q.luaChon || q.lua_chon || []).map((c: any) => ({
      kyHieu: c.kyHieu || c.ky_hieu || '',
      noiDung: c.noiDung || c.noi_dung || '',
    })),
    dapAnDung: q.dapAnDung || q.dap_an_dung || 'A',
  }))

  const updateQuestion = (qIndex: number, newQ: QuizQuestion) => {
    const nextQ = [...questions]
    nextQ[qIndex] = newQ
    onChange({ questions: nextQ })
  }

  const addQuestion = () => {
    onChange({
      questions: [...questions, {
        cauHoi: '',
        luaChon: [
          { kyHieu: 'A', noiDung: '' },
          { kyHieu: 'B', noiDung: '' },
          { kyHieu: 'C', noiDung: '' },
          { kyHieu: 'D', noiDung: '' },
        ],
        dapAnDung: 'A'
      }]
    })
  }

  const removeQuestion = (qIndex: number) => {
    if (questions.length === 1) return
    onChange({ questions: questions.filter((_, i) => i !== qIndex) })
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="relative flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[13px] font-bold text-black">Câu {qIndex + 1}:</label>
          </div>
          <input value={q.cauHoi} onChange={e => updateQuestion(qIndex, { ...q, cauHoi: e.target.value })} className={'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[15px] outline-none focus:border-primary mb-3'} placeholder="Nhập câu hỏi..." />
          <div className="flex flex-col gap-2">
            {q.luaChon.map((c: any, i: number) => {
              const isCorrect = q.dapAnDung === c.kyHieu
              return (
                <div key={c.kyHieu} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${isCorrect ? 'border-green-300 bg-[#F0FDF4]' : 'border-gray-100 bg-white shadow-sm'}`}>
                  <button type="button" onClick={() => updateQuestion(qIndex, { ...q, dapAnDung: c.kyHieu })} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${isCorrect ? 'bg-[#4ADE80] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {c.kyHieu}
                  </button>
                  <input value={c.noiDung} onChange={e => {
                    const luaChon = q.luaChon.map((opt: any, idx: number) => idx === i ? { ...opt, noiDung: e.target.value } : opt)
                    updateQuestion(qIndex, { ...q, luaChon })
                  }} className={`flex-1 bg-transparent text-[15px] outline-none ${isCorrect ? 'text-[#22C55E] font-medium placeholder:text-[#4ADE80]' : 'text-black placeholder:text-gray-500'}`} placeholder={`Đáp án ${c.kyHieu}...`} />
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-[12px] text-black">Click vào chữ cái để chọn đáp án đúng</p>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="font-bold text-primary text-sm self-start hover:opacity-80 flex items-center gap-1">
        + Thêm câu hỏi
      </button>
    </div>
  )
}

// ─── Block wrapper ────────────────────────────────────────────────────────────

function BlockWrapper({
  section, idx, total, onRemove, onUpdate
}: {
  section: Section; idx: number; total: number
  onRemove: () => void; onUpdate: (data: SectionData) => void
}) {
  const label = SECTION_LABELS[section.loai]
  return (
    <div className="rounded-xl bg-white">
      {/* Block header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <span className="cursor-grab text-[#5B5B5B] hover:opacity-70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
            </svg>
          </span>
          {/* Type badge */}
          <span className="rounded-md border border-[#B3B3B3] bg-transparent px-2.5 py-0.5 text-xs font-semibold text-[#5B5B5B]">{label}</span>
        </div>
        <button type="button" onClick={onRemove} className="text-black hover:opacity-70 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" fill="currentColor" width="14" height="18">
            <path fillRule="evenodd" clipRule="evenodd" d="M5 1h4v1H5z M1 3h12v1H1z M2 5v12h10V5H2z M3 6h8v10H3V6z M5 8h1v6H5V8z M8 8h1v6H8V8z" />
          </svg>
        </button>
      </div>

      {/* Block content */}
      <div className="p-4">
        {section.loai === 'TEXT' && <TextEditor data={section.data as TextData} onChange={onUpdate} />}
        {section.loai === 'VOCABULARY' && <VocabEditor data={section.data as VocabData} onChange={onUpdate} />}
        {section.loai === 'GRAMMAR' && <GrammarEditor data={section.data as GrammarData} onChange={onUpdate} />}
        {section.loai === 'VIDEO' && <VideoEditor data={section.data as VideoData} onChange={onUpdate} />}
        {section.loai === 'MINI_QUIZ' && <QuizEditor data={section.data as QuizData} onChange={onUpdate} />}
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default forwardRef<LessonFormHandle, LessonFormProps>(function LessonForm({ lessonId, defaultValues }, ref) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [anhBiaPreview, setAnhBiaPreview] = useState(defaultValues?.anhBia ?? '')
  const [anhBiaFile, setAnhBiaFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [tieuDe, setTieuDe] = useState(defaultValues?.tieuDe ?? '')
  const [moTa, setMoTa] = useState(defaultValues?.moTa ?? '')
  const [level, setLevel] = useState(defaultValues?.level ?? 'A1')
  const [chuDe, setChuDe] = useState(defaultValues?.chuDe ?? 'VOCABULARY')
  const [thoiGianDoc, setThoiGianDoc] = useState<number | ''>(defaultValues?.thoiGianDoc ?? 5)
  const [sections, setSections] = useState<Section[]>(defaultValues?.sections ?? [])

  const addSection = (loai: SectionType) => {
    setSections(prev => [...prev, { loai, data: defaultData(loai), thuTu: prev.length }])
    setShowBlockPicker(false)
  }

  const removeSection = (idx: number) => setSections(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, thuTu: i })))

  const updateSection = (idx: number, data: SectionData) => setSections(prev => prev.map((s, i) => i === idx ? { ...s, data } : s))

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, isPublishArg?: boolean) => {
    if (e) e.preventDefault()
    const action = e ? (e.nativeEvent as SubmitEvent).submitter || document.activeElement : null
    const isPublish = isPublishArg ?? ((action as HTMLButtonElement)?.value === 'publish')

    setSaving(true)
    setError('')
    setFieldErrors({})

    let hasError = false
    const errors: Record<string, string> = {}

    if (!tieuDe.trim()) {
      errors.tieuDe = 'Vui lòng nhập tiêu đề'
      hasError = true
    }
    const thoiGianNum = Number(thoiGianDoc)
    if (thoiGianNum <= 0 || isNaN(thoiGianNum)) {
      errors.thoiGianDoc = 'Thời gian đọc phải là số dương'
      hasError = true
    }

    if (hasError) {
      setFieldErrors(errors)
      setSaving(false)
      return
    }

    let finalAnhBia = anhBiaPreview
    if (anhBiaFile) {
      const formData = new FormData()
      formData.append('file', anhBiaFile)
      formData.append('folder', 'lessons')
      
      try {
        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || uploadData.error || 'Không thể upload ảnh bìa')
        }
        finalAnhBia = uploadData.data.url
      } catch (err: any) {
        setError(err.message || 'Lỗi upload ảnh')
        setSaving(false)
        return
      }
    }

    // Serialize sections to noiDung JSON string
    const serializedSections = sections.map((s, i) => ({
      loai: s.loai,
      noiDung: JSON.stringify(s.data),
      thuTu: i,
    }))

    const payload = { tieuDe, moTa: moTa || undefined, level, chuDe, anhBia: finalAnhBia || undefined, thoiGianDoc: thoiGianNum, isPublish, sections: serializedSections }

    try {
      const res = await fetch(lessonId ? `/api/bai-hoc/${lessonId}` : '/api/bai-hoc', {
        method: lessonId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error?.message ?? data.message ?? 'Có lỗi xảy ra'
        if (msg.includes('slug') || msg.includes('Unique constraint failed')) {
          setFieldErrors({ tieuDe: 'Slug đã tồn tại' })
        } else {
          setError(msg)
        }
      } else {
        toast('Lưu thành công!', 'success')
        router.push('/admin/bai-hoc')
        router.refresh()
      }
    } catch {
      setError('Không thể kết nối server')
    } finally {
      setSaving(false)
    }
  }

  useImperativeHandle(ref, () => ({
    submit: async (isPublish: boolean) => {
      await handleSubmit(undefined, isPublish)
    },
    handleDelete: async () => {
      if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return
      setSaving(true)
      setError('')
      try {
        const res = await fetch(`/api/bai-hoc/${lessonId}`, { method: 'DELETE' })
        if (!res.ok) {
          const e = await res.json()
          throw new Error(e.error || 'Lỗi xóa bài học')
        }
        router.push('/admin/bai-hoc')
        router.refresh()
      } catch (e: any) {
        setError(e.message)
        setSaving(false)
      }
    }
  }))

  return (
    <form id="lesson-form" onSubmit={handleSubmit}>
      <div className="max-w-6xl px-6 py-2 flex flex-col gap-8">
        {/* ── TOP SECTION ── */}
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

            {/* Tiêu đề */}
            <div>
              <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Tiêu đề bài học</label>
              <input value={tieuDe} onChange={e => { setTieuDe(e.target.value); setFieldErrors(p => ({...p, tieuDe: ''})) }} className={`${INPUT} ${fieldErrors.tieuDe ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`} placeholder="Tiêu đề bài học" />
              {fieldErrors.tieuDe && <p className="mt-1.5 text-sm font-semibold text-red-500">{fieldErrors.tieuDe}</p>}
            </div>

            {/* Mô tả */}
            <div>
              <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Mô tả ngắn</label>
              <textarea rows={2} value={moTa} onChange={e => setMoTa(e.target.value)} className={INPUT + ' resize-none'} placeholder="Tóm tắt 1-2 câu về nội dung bài học" />
            </div>

            {/* Cấp độ + Chủ đề + Thời gian */}
            <div className="flex gap-6">
              <div className="w-28">
                <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Cấp độ</label>
                <select value={level} onChange={e => setLevel(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-[15px] outline-none focus:border-primary">
                  {['A1', 'A2', 'B1', 'B2'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="w-36">
                <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Chủ đề</label>
                <select value={chuDe} onChange={e => setChuDe(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-[15px] outline-none focus:border-primary">
                  <option value="VOCABULARY">Từ vựng</option>
                  <option value="GRAMMAR">Ngữ pháp</option>
                  <option value="LISTENING">Nghe</option>
                  <option value="READING">Đọc</option>
                </select>
              </div>
              <div className="w-40">
                <label className="mb-1.5 block text-[15px] font-semibold text-gray-700 whitespace-nowrap">Thời gian đọc</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={thoiGianDoc} onChange={e => { setThoiGianDoc(e.target.value === '' ? '' : Number(e.target.value)); setFieldErrors(p => ({...p, thoiGianDoc: ''})) }} className={`w-full rounded-lg border px-2 py-2 text-[15px] outline-none focus:border-primary ${fieldErrors.thoiGianDoc ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`} />
                  <span className="shrink-0 text-[15px] text-gray-500">phút</span>
                </div>
                {fieldErrors.thoiGianDoc && <p className="mt-1.5 text-sm font-semibold text-red-500">{fieldErrors.thoiGianDoc}</p>}
              </div>
            </div>

          </div>

          {/* ── RIGHT — Ảnh bìa ── */}
          <div className="w-72 shrink-0">
            <div className="sticky top-4 rounded-2xl bg-white p-5">
              <label className="mb-3 block text-[19px] font-bold text-gray-900">Ảnh bìa</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 transition-colors hover:border-gray-400"
                style={{ minHeight: 160 }}
              >
                {anhBiaPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={anhBiaPreview} alt="Preview" className="max-h-40 w-full rounded-lg object-cover" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="mb-3 text-black">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-center text-[15px] font-bold text-gray-600 leading-snug max-w-[160px]">
                      Tải ảnh lên hoặc kéo thả vào đây - Tối đa 10MB
                    </p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (file) {
                  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
                  if (!allowedTypes.includes(file.type)) {
                    setFieldErrors(p => ({ ...p, anhBia: 'Định dạng không hỗ trợ. Chấp nhận: JPG, PNG, WebP' }))
                    return
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setFieldErrors(p => ({ ...p, anhBia: 'File vượt quá giới hạn: ảnh 10MB' }))
                    return
                  }
                  setFieldErrors(p => ({ ...p, anhBia: '' }))
                  setAnhBiaFile(file)
                  setAnhBiaPreview(URL.createObjectURL(file))
                }
              }} />
              {fieldErrors.anhBia && <p className="mt-2 text-center text-sm font-semibold text-red-500">{fieldErrors.anhBia}</p>}
              {anhBiaPreview && (
                <button type="button" onClick={() => { setAnhBiaPreview(''); setAnhBiaFile(null); setFieldErrors(p => ({...p, anhBia: ''})) }} className="mt-2 w-full text-center text-xs text-red-400 hover:text-red-600">
                  Xóa ảnh
                </button>
              )}



              {/* Saving indicator */}
              {saving && <p className="mt-3 text-center text-xs text-primary">Đang lưu...</p>}
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: Nội dung bài học ── */}
        <div>
          <label className="mb-3 block text-[15px] font-semibold text-gray-700">Nội dung bài học</label>
          <div className="flex flex-col gap-3">
            {sections.map((s, idx) => (
              <BlockWrapper
                key={idx}
                section={s}
                idx={idx}
                total={sections.length}
                onRemove={() => removeSection(idx)}
                onUpdate={data => updateSection(idx, data)}
              />
            ))}
          </div>

          {/* Add block button */}
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => setShowBlockPicker(v => !v)}
              className="w-full rounded-xl border-2 border-dashed border-gray-300 py-4 text-base font-bold text-black transition-colors hover:border-gray-400"
            >
              + Thêm block mới
            </button>

            {/* Block picker */}
            {showBlockPicker && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-100 p-4">
                  <p className="text-[13px] font-bold uppercase tracking-wide text-black">CHỌN LOẠI BLOCK</p>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4">
                  {BLOCK_TYPES.map(bt => (
                    <button
                      key={bt.type}
                      type="button"
                      onClick={() => addSection(bt.type)}
                      className="flex items-center justify-center rounded-xl border border-gray-200 py-5 text-[13px] font-bold text-black transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
})
