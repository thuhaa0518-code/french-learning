'use client'

import type { TextSectionContent, VocabularySectionContent, GrammarSectionContent, MiniQuizContent } from '@/types'
import MiniQuiz from './MiniQuiz'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/ToastProvider'

interface SectionProps {
  loai: string
  noiDung: string
  thuTu: number
}

export default function SectionRenderer({ loai, noiDung }: SectionProps) {
  let content: unknown
  try {
    content = JSON.parse(noiDung)
  } catch {
    content = { content: noiDung }
  }

  switch (loai) {
    case 'TEXT':
      return <TextBlock data={content as TextSectionContent} />
    case 'VOCABULARY':
      return <VocabularyTable data={content as VocabularySectionContent} />
    case 'GRAMMAR':
      return <GrammarBlock data={content as GrammarSectionContent} />
    case 'VIDEO':
      return <YouTubeEmbed youtubeId={(content as { id?: string; youtubeId?: string }).id ?? (content as { id?: string; youtubeId?: string }).youtubeId ?? ''} />
    case 'MINI_QUIZ':
      return <MiniQuiz data={content as MiniQuizContent} />
    default:
      return <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Loại section chưa được hỗ trợ: {loai}</div>
  }
}

function TextBlock({ data }: { data: TextSectionContent }) {
  return (
    <div className="prose prose-gray max-w-none">
      <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{data.content}</p>
    </div>
  )
}

function VocabularyTable({ data }: { data: VocabularySectionContent }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-[#FAEAFF] text-[#CB30E0] px-5 py-3 font-semibold text-sm flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        {data.title || 'Từ vựng bài học'}
      </div>
      <table className="w-full text-sm bg-white">
        <tbody>
          {data.words?.map((word, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4 w-1/3">
                <div className="font-bold text-gray-900 text-[15px]">{word.tuPhap}</div>
                <div className="text-gray-500 text-xs mt-1">/{word.phatAm}/</div>
              </td>
              <td className="px-5 py-4 w-auto">
                <div className="text-gray-800">{word.nghiaViet}</div>
              </td>
              <td className="px-5 py-4 w-16 text-right">
                <button className="text-gray-400 hover:text-[#CB30E0] transition-colors p-2 rounded-full hover:bg-purple-50" title="Nghe phát âm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GrammarBlock({ data }: { data: GrammarSectionContent }) {
  return (
    <div className="rounded-r-xl border-l-4 border-[#CB30E0] bg-white p-6 shadow-sm border-y border-r border-gray-100">
      <h3 className="mb-3 text-xs font-bold text-[#CB30E0] uppercase tracking-wider">Ngữ pháp</h3>
      {data.title && <h4 className="mb-3 text-[15px] font-bold text-gray-900">{data.title}</h4>}
      {data.giaiThich && <p className="mb-3 text-[14px] text-gray-800 leading-relaxed">{data.giaiThich}</p>}
      {data.viDuPhap && (
        <div className="mb-2 mt-4 rounded-lg bg-gray-50 px-4 py-3 border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Ví dụ</span>
          <p className="mt-1 font-bold text-gray-900">{data.viDuPhap}</p>
          {data.dichNghia && <p className="mt-1 text-sm text-gray-600">{data.dichNghia}</p>}
        </div>
      )}
      {data.viDuCau && <p className="text-sm italic text-gray-500 mt-2">{data.viDuCau}</p>}
    </div>
  )
}

function YouTubeEmbed({ youtubeId }: { youtubeId: string }) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!youtubeId) return
    const img = new Image()
    img.onload = () => {
      if (img.width <= 120) {
        setIsValid(false)
        toast('Video không khả dụng', 'error')
      } else {
        setIsValid(true)
      }
    }
    img.onerror = () => {
      setIsValid(false)
      toast('Video không khả dụng', 'error')
    }
    img.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
  }, [youtubeId, toast])

  if (!youtubeId || isValid === false) return null

  return (
    <div className="aspect-video overflow-hidden rounded-xl relative bg-gray-100">
      {isValid === null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      {isValid === true && (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          title="YouTube video"
        />
      )}
    </div>
  )
}
