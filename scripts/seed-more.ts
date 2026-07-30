import { prisma } from '../lib/prisma'

async function main() {
  console.log('Bắt đầu thêm dữ liệu Bài học & Flashcard giả...')

  const levels = ['A1', 'A2', 'B1', 'B2']
  const topics = ['VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING']

  // Seed 20 Lessons
  for (let i = 1; i <= 20; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const topic = topics[Math.floor(Math.random() * topics.length)]
    
    await prisma.lesson.upsert({
      where: { slug: `bai-hoc-mau-${i}` },
      update: {},
      create: {
        slug: `bai-hoc-mau-${i}`,
        tieuDe: `Bài học mẫu ${topic} - ${level} - Số ${i}`,
        level: level,
        chuDe: topic,
        thoiGianDoc: Math.floor(Math.random() * 15) + 5,
        isPublish: true,
      }
    })
  }
  console.log('Đã thêm 20 Bài học!')

  // Seed 20 Flashcard Decks
  for (let i = 1; i <= 20; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    
    await prisma.flashcardDeck.create({
      data: {
        tieuDe: `Bộ thẻ từ vựng ${level} - Chủ đề ${i}`,
        moTa: `Bộ flashcard giúp bạn thuộc nhanh từ vựng trình độ ${level}.`,
        level: level,
        isPublish: true,
        flashcards: {
          create: Array.from({ length: Math.floor(Math.random() * 15) + 5 }).map((_, fIndex) => ({
            tuPhap: `Mot ${fIndex + 1}`,
            nghiaViet: `Từ số ${fIndex + 1}`,
            phatAm: `/mɔt/`,
            viDu: `C'est un mot. (Đây là một từ)`
          }))
        }
      }
    })
  }
  console.log('Đã thêm 20 Bộ Flashcard!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
