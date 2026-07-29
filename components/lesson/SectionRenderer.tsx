import type { TextSectionContent, VocabularySectionContent, GrammarSectionContent, MiniQuizContent } from '@/types'
import MiniQuiz from './MiniQuiz'

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
    <div>
      {data.title && <h3 className="mb-4 text-lg font-semibold text-gray-900">{data.title}</h3>}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Từ pháp</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Phát âm</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Nghĩa</th>
            </tr>
          </thead>
          <tbody>
            {data.words?.map((word, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-primary">{word.tuPhap}</td>
                <td className="px-4 py-3 text-gray-500 italic">{word.phatAm}</td>
                <td className="px-4 py-3 text-gray-700">{word.nghiaViet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GrammarBlock({ data }: { data: GrammarSectionContent }) {
  return (
    <div className="rounded-xl border-l-4 border-primary bg-purple-50 p-6">
      {data.title && <h3 className="mb-3 text-lg font-semibold text-gray-900">{data.title}</h3>}
      {data.giaiThich && <p className="mb-3 text-gray-700">{data.giaiThich}</p>}
      {data.viDuPhap && (
        <div className="mb-2 rounded-lg bg-white/70 px-4 py-3">
          <span className="text-xs font-medium text-gray-500 uppercase">Ví dụ</span>
          <p className="mt-1 font-medium text-primary">{data.viDuPhap}</p>
        </div>
      )}
      {data.viDuCau && <p className="text-sm italic text-gray-600">{data.viDuCau}</p>}
      {data.dichNghia && <p className="mt-1 text-sm text-gray-500">{data.dichNghia}</p>}
    </div>
  )
}

function YouTubeEmbed({ youtubeId }: { youtubeId: string }) {
  if (!youtubeId) return null
  return (
    <div className="aspect-video overflow-hidden rounded-xl">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
        title="YouTube video"
      />
    </div>
  )
}
