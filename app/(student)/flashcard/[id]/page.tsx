import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StudySession from '@/components/flashcard/StudySession'

export default async function FlashcardStudyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const deck = await prisma.flashcardDeck.findFirst({
    where: { id, isPublish: true },
    include: { flashcards: { orderBy: { tuPhap: 'asc' } } },
  })

  if (!deck) notFound()

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-8 text-2xl font-extrabold tracking-widest text-primary">FLASHCARD</h1>
        <StudySession deck={deck} />
      </div>
    </div>
  )
}
