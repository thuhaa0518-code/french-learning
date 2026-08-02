/**
 * seed-demo.ts
 * Dữ liệu demo cụ thể cho kịch bản quay video:
 *   - 1 Bài học A1: "Chào hỏi cơ bản"
 *   - 1 Đề thi A1: "Kiểm tra A1 - Bài 1" (5 câu hỏi thực tế)
 *   - 1 Bộ Flashcard A1: "Từ vựng Chào hỏi - A1" (8 thẻ từ)
 *
 * Chạy lệnh: npx tsx scripts/seed-demo.ts
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('🚀 Bắt đầu tạo dữ liệu demo...')

  // ──────────────────────────────────────────────
  // 1. BÀI HỌC: "Chào hỏi cơ bản"
  // ──────────────────────────────────────────────
  console.log('\n📚 Tạo bài học "Chào hỏi cơ bản"...')

  const lesson = await prisma.lesson.upsert({
    where: { slug: 'chao-hoi-co-ban-a1' },
    update: {},
    create: {
      slug: 'chao-hoi-co-ban-a1',
      tieuDe: 'Chào hỏi cơ bản',
      level: 'A1',
      chuDe: 'Giao tiếp',
      thoiGianDoc: 8,
      isPublish: true,
      sections: {
        create: [
          {
            thuTu: 1,
            loai: 'TEXT',
            noiDung: JSON.stringify({
              content:
                'Chào mừng bạn đến với bài học đầu tiên! Trong bài này, chúng ta sẽ học cách chào hỏi và giới thiệu bản thân bằng tiếng Pháp — kỹ năng quan trọng nhất khi bắt đầu giao tiếp.\n\nTiếng Pháp phân biệt hai cách xưng hô:\n• "tu" — dùng với bạn bè, người thân, trẻ em.\n• "vous" — dùng với người lạ, cấp trên, hoặc số nhiều.',
            }),
          },
          {
            thuTu: 2,
            loai: 'VIDEO',
            noiDung: JSON.stringify({
              youtubeId: 'ukCl4UQethI',
            }),
          },
          {
            thuTu: 3,
            loai: 'VOCABULARY',
            noiDung: JSON.stringify({
              title: 'Từ vựng trọng tâm',
              words: [
                { tuPhap: 'Bonjour', phatAm: '/bɔ̃.ʒuʁ/', nghiaViet: 'Xin chào (ban ngày)' },
                { tuPhap: 'Bonsoir', phatAm: '/bɔ̃.swaʁ/', nghiaViet: 'Chào buổi tối' },
                { tuPhap: 'Salut', phatAm: '/sa.ly/', nghiaViet: 'Chào (thân mật)' },
                { tuPhap: 'Au revoir', phatAm: '/o ʁə.vwaʁ/', nghiaViet: 'Tạm biệt' },
                { tuPhap: 'Merci', phatAm: '/mɛʁ.si/', nghiaViet: 'Cảm ơn' },
                { tuPhap: "S'il vous plaît", phatAm: '/sil vu plɛ/', nghiaViet: 'Làm ơn / Xin hãy' },
                { tuPhap: 'Comment vous appelez-vous ?', phatAm: '/kɔ.mɑ̃ vu za.ple vu/', nghiaViet: 'Bạn tên là gì?' },
                { tuPhap: "Je m'appelle...", phatAm: '/ʒə ma.pɛl/', nghiaViet: 'Tôi tên là...' },
              ],
            }),
          },
          {
            thuTu: 4,
            loai: 'GRAMMAR',
            noiDung: JSON.stringify({
              title: "Ngữ pháp: Động từ \"s'appeler\" (tên là)",
              giaiThich:
                'Động từ "s\'appeler" là động từ phản thân, dùng để giới thiệu tên. Cách chia ở thì hiện tại:',
              viDuPhap: "Je m'appelle An. Et vous, comment vous appelez-vous ?",
              viDuCau: 'Tôi tên là An. Còn bạn, bạn tên là gì?',
              dichNghia:
                'Lưu ý: "Je" = Tôi, "Vous" = Bạn/Quý vị. Luôn thêm "?" khi đặt câu hỏi trong văn nói.',
            }),
          },
          {
            thuTu: 5,
            loai: 'MINI_QUIZ',
            noiDung: JSON.stringify({
              question: 'Làm thế nào để nói "Xin chào" vào buổi tối trong tiếng Pháp?',
              options: ['Bonjour', 'Salut', 'Bonsoir', 'Au revoir'],
              correctIndex: 2,
              explanation:
                '"Bonsoir" dùng để chào vào buổi tối. "Bonjour" dùng ban ngày, "Salut" là thân mật, "Au revoir" là tạm biệt.',
            }),
          },
        ],
      },
    },
  })

  console.log(`✅ Đã tạo bài học: "${lesson.tieuDe}" (id: ${lesson.id})`)

  // ──────────────────────────────────────────────
  // 2. ĐỀ THI: "Kiểm tra A1 - Bài 1: Chào hỏi"
  // ──────────────────────────────────────────────
  console.log('\n📝 Tạo đề thi "Kiểm tra A1 - Bài 1: Chào hỏi"...')

  await prisma.exam.deleteMany({
    where: { tieuDe: 'Kiểm tra A1 - Bài 1: Chào hỏi' },
  })

  const exam = await prisma.exam.create({
    data: {
      tieuDe: 'Kiểm tra A1 - Bài 1: Chào hỏi',
      moTa: 'Bài kiểm tra nhanh 5 câu để ôn lại kiến thức về chào hỏi trong tiếng Pháp. Thời gian làm bài: 10 phút.',
      level: 'A1',
      thoiGianLam: 10,
      isPublish: true,
      questions: {
        create: [
          {
            thuTu: 1,
            noiDung: 'Từ nào dùng để chào khi gặp mặt vào ban ngày?',
            giaiThich: '"Bonjour" là lời chào thông dụng nhất, dùng từ sáng đến chiều tối. "Bonsoir" dùng từ chiều tối trở đi.',
            answers: {
              create: [
                { noiDung: 'Bonjour', laDapAnDung: true },
                { noiDung: 'Bonsoir', laDapAnDung: false },
                { noiDung: 'Au revoir', laDapAnDung: false },
                { noiDung: 'Merci', laDapAnDung: false },
              ],
            },
          },
          {
            thuTu: 2,
            noiDung: 'Câu "Comment vous appelez-vous ?" có nghĩa là gì?',
            giaiThich: 'Đây là câu hỏi lịch sự để hỏi tên người khác. Trả lời bằng "Je m\'appelle + tên".',
            answers: {
              create: [
                { noiDung: 'Bạn khỏe không?', laDapAnDung: false },
                { noiDung: 'Bạn tên là gì?', laDapAnDung: true },
                { noiDung: 'Bạn bao nhiêu tuổi?', laDapAnDung: false },
                { noiDung: 'Bạn ở đâu?', laDapAnDung: false },
              ],
            },
          },
          {
            thuTu: 3,
            noiDung: 'Điền vào chỗ trống: "Je _______ An." (Tôi tên là An.)',
            giaiThich: '"Je m\'appelle" là cụm từ cố định dùng để giới thiệu tên bản thân trong tiếng Pháp.',
            answers: {
              create: [
                { noiDung: "m'appelle", laDapAnDung: true },
                { noiDung: 'suis', laDapAnDung: false },
                { noiDung: 'parle', laDapAnDung: false },
                { noiDung: 'ai', laDapAnDung: false },
              ],
            },
          },
          {
            thuTu: 4,
            noiDung: '"Merci beaucoup" có nghĩa là gì?',
            giaiThich: '"Merci" = Cảm ơn, "beaucoup" = rất nhiều. Kết hợp lại là "Cảm ơn rất nhiều".',
            answers: {
              create: [
                { noiDung: 'Xin chào', laDapAnDung: false },
                { noiDung: 'Tạm biệt', laDapAnDung: false },
                { noiDung: 'Cảm ơn rất nhiều', laDapAnDung: true },
                { noiDung: 'Làm ơn', laDapAnDung: false },
              ],
            },
          },
          {
            thuTu: 5,
            noiDung: 'Từ nào là lời chào tạm biệt trong tiếng Pháp?',
            giaiThich: '"Au revoir" dùng khi chia tay. "Salut" vừa dùng để chào vừa tạm biệt nhưng chỉ dùng thân mật.',
            answers: {
              create: [
                { noiDung: 'Bonjour', laDapAnDung: false },
                { noiDung: "S'il vous plaît", laDapAnDung: false },
                { noiDung: 'Merci', laDapAnDung: false },
                { noiDung: 'Au revoir', laDapAnDung: true },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`✅ Đã tạo đề thi: "${exam.tieuDe}" với 5 câu hỏi (id: ${exam.id})`)

  // ──────────────────────────────────────────────
  // 3. BỘ FLASHCARD: "Từ vựng Chào hỏi - A1"
  // ──────────────────────────────────────────────
  console.log('\n🃏 Tạo bộ Flashcard "Từ vựng Chào hỏi - A1"...')

  await prisma.flashcardDeck.deleteMany({
    where: { tieuDe: 'Từ vựng Chào hỏi - A1' },
  })

  const deck = await prisma.flashcardDeck.create({
    data: {
      tieuDe: 'Từ vựng Chào hỏi - A1',
      moTa: 'Bộ thẻ ôn luyện 8 từ vựng chào hỏi cơ bản nhất trong tiếng Pháp dành cho người mới bắt đầu.',
      level: 'A1',
      isPublish: true,
      flashcards: {
        create: [
          {
            tuPhap: 'Bonjour',
            nghiaViet: 'Xin chào (ban ngày)',
            phatAm: '/bɔ̃.ʒuʁ/',
            viDu: "Bonjour, je m'appelle Marie. (Xin chào, tôi tên là Marie.)",
          },
          {
            tuPhap: 'Bonsoir',
            nghiaViet: 'Chào buổi tối',
            phatAm: '/bɔ̃.swaʁ/',
            viDu: 'Bonsoir ! Comment ça va ? (Chào buổi tối! Bạn khỏe không?)',
          },
          {
            tuPhap: 'Salut',
            nghiaViet: 'Chào / Tạm biệt (thân mật)',
            phatAm: '/sa.ly/',
            viDu: 'Salut, ça va ? (Chào, bạn khỏe không?)',
          },
          {
            tuPhap: 'Au revoir',
            nghiaViet: 'Tạm biệt',
            phatAm: '/o ʁə.vwaʁ/',
            viDu: 'Au revoir et bonne journée ! (Tạm biệt và chúc một ngày tốt lành!)',
          },
          {
            tuPhap: 'Merci',
            nghiaViet: 'Cảm ơn',
            phatAm: '/mɛʁ.si/',
            viDu: 'Merci beaucoup ! (Cảm ơn rất nhiều!)',
          },
          {
            tuPhap: "S'il vous plaît",
            nghiaViet: 'Làm ơn / Xin hãy (lịch sự)',
            phatAm: '/sil vu plɛ/',
            viDu: "Un café, s'il vous plaît. (Cho tôi một cà phê, làm ơn.)",
          },
          {
            tuPhap: "Je m'appelle...",
            nghiaViet: 'Tôi tên là...',
            phatAm: '/ʒə ma.pɛl/',
            viDu: "Je m'appelle Thomas. (Tôi tên là Thomas.)",
          },
          {
            tuPhap: 'Comment ça va ?',
            nghiaViet: 'Bạn khỏe không?',
            phatAm: '/kɔ.mɑ̃ sa va/',
            viDu: 'Bonjour ! Comment ça va ? — Ça va bien, merci ! (Chào! Bạn khỏe không? — Khỏe, cảm ơn!)',
          },
        ],
      },
    },
  })

  console.log(`✅ Đã tạo bộ Flashcard: "${deck.tieuDe}" với 8 thẻ (id: ${deck.id})`)

  // ──────────────────────────────────────────────
  // TỔNG KẾT
  // ──────────────────────────────────────────────
  console.log('\n🎉 Hoàn tất! Dữ liệu demo đã sẵn sàng:')
  console.log('   📚 Bài học : "Chào hỏi cơ bản" (A1)  → /bai-hoc/chao-hoi-co-ban-a1')
  console.log('   📝 Đề thi  : "Kiểm tra A1 - Bài 1: Chào hỏi" (10 phút, 5 câu)')
  console.log('   🃏 Flashcard: "Từ vựng Chào hỏi - A1" (8 thẻ)')
  console.log('\n👉 Kịch bản demo:')
  console.log('   1. [ADMIN]   Đăng nhập Admin → Kiểm tra 3 mục trên → Xem trước')
  console.log('   2. [ADMIN]   Sửa thử tiêu đề → Lưu → Thấy thay đổi ngay')
  console.log('   3. [STUDENT] Vào /bai-hoc → Mở "Chào hỏi cơ bản" → Đọc & xem video')
  console.log('   4. [STUDENT] Vào /de-thi → Làm bài kiểm tra → Xem kết quả & giải thích')
  console.log('   5. [STUDENT] Vào /flashcard → Học 8 thẻ → Đánh giá Dễ/Khó/Làm lại')
  console.log('   6. [ADMIN]   Vào Dashboard → Thấy học viên đã làm bài')
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
