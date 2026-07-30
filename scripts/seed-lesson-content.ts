import { prisma } from '../lib/prisma'

async function main() {
  console.log('Bắt đầu thêm nội dung giả định cho các Bài học...')

  const lessons = await prisma.lesson.findMany({
    include: { sections: true }
  })

  let count = 0

  for (const lesson of lessons) {
    if (lesson.sections.length > 0) {
      continue // Bỏ qua nếu bài học đã có nội dung
    }

    // Thêm các section cơ bản: TEXT, VOCABULARY, GRAMMAR, VIDEO, MINI_QUIZ
    await prisma.lessonSection.createMany({
      data: [
        {
          lessonId: lesson.id,
          loai: 'TEXT',
          thuTu: 1,
          noiDung: JSON.stringify({
            content: `Chào mừng bạn đến với ${lesson.tieuDe}! Trong bài học này, chúng ta sẽ cùng tìm hiểu về các khái niệm cơ bản và cách áp dụng vào thực tế. Hãy chuẩn bị sẵn sàng để bắt đầu hành trình chinh phục tiếng Pháp nhé!`
          })
        },
        {
          lessonId: lesson.id,
          loai: 'VIDEO',
          thuTu: 2,
          noiDung: JSON.stringify({
            youtubeId: '9n72mN7gV9c' // Một ID youtube ngẫu nhiên (ví dụ)
          })
        },
        {
          lessonId: lesson.id,
          loai: 'VOCABULARY',
          thuTu: 3,
          noiDung: JSON.stringify({
            title: 'Từ vựng trọng tâm',
            words: [
              { tuPhap: 'Bonjour', phatAm: '/bɔ̃.ʒuʁ/', nghiaViet: 'Xin chào' },
              { tuPhap: 'Merci', phatAm: '/mɛʁ.si/', nghiaViet: 'Cảm ơn' },
              { tuPhap: 'S\'il vous plaît', phatAm: '/sil vu plɛ/', nghiaViet: 'Làm ơn' },
              { tuPhap: 'Au revoir', phatAm: '/o ʁə.vwaʁ/', nghiaViet: 'Tạm biệt' },
            ]
          })
        },
        {
          lessonId: lesson.id,
          loai: 'GRAMMAR',
          thuTu: 4,
          noiDung: JSON.stringify({
            title: 'Ngữ pháp cơ bản',
            giaiThich: 'Trong tiếng Pháp, động từ phải được chia theo ngôi (chủ ngữ) tương ứng.',
            viDuPhap: 'Je parle français.',
            viDuCau: 'Tôi nói tiếng Pháp.',
            dichNghia: 'Đây là ví dụ về động từ nhóm 1 (kết thúc bằng -er) chia ở thì hiện tại.'
          })
        },
        {
          lessonId: lesson.id,
          loai: 'MINI_QUIZ',
          thuTu: 5,
          noiDung: JSON.stringify({
            question: 'Làm thế nào để nói "Cảm ơn" trong tiếng Pháp?',
            options: ['Bonjour', 'Merci', 'Oui', 'Non'],
            correctIndex: 1,
            explanation: '"Merci" có nghĩa là Cảm ơn. "Bonjour" là Xin chào, "Oui" là Có, "Non" là Không.'
          })
        }
      ]
    })
    
    count++
  }

  console.log(`Đã thêm nội dung cho ${count} bài học thành công!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
