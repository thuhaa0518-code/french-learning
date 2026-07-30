import { prisma } from '../lib/prisma'

async function main() {
  console.log('Bắt đầu thêm dữ liệu đề thi giả...')

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const times = [15, 30, 45, 60, 90, 120]

  // Create 20 dummy exams
  for (let i = 1; i <= 20; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const time = times[Math.floor(Math.random() * times.length)]
    
    console.log(`Đang tạo đề thi số ${i}...`)
    
    await prisma.exam.create({
      data: {
        tieuDe: `Đề Luyện Tập ${level} - Số ${i + 5}`, // To not overlap with existing ones
        moTa: `Bộ đề ôn tập trình độ ${level} tổng hợp các kỹ năng cần thiết.`,
        level: level,
        thoiGianLam: time,
        isPublish: true, // Make them published so they show up on the public page
        questions: {
          create: Array.from({ length: Math.floor(Math.random() * 10) + 5 }).map((_, qIndex) => ({
            noiDung: `Câu hỏi trắc nghiệm số ${qIndex + 1} cho đề luyện tập ${level}?`,
            giaiThich: `Giải thích chi tiết cho câu hỏi ${qIndex + 1}`,
            thuTu: qIndex,
            answers: {
              create: [
                { noiDung: `Đáp án A`, laDapAnDung: true },
                { noiDung: `Đáp án B`, laDapAnDung: false },
                { noiDung: `Đáp án C`, laDapAnDung: false },
                { noiDung: `Đáp án D`, laDapAnDung: false },
              ]
            }
          }))
        }
      }
    })
  }

  console.log('Đã thêm thành công 20 đề thi mẫu!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
