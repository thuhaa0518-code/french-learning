import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
try {
  const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* ignore */ }

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  console.log('🌱 Seeding database...')

  // ── LESSONS ────────────────────────────────────────────────────────
  const lessons = [
    {
      slug: 'les-salutations-cach-chao-hoi',
      tieuDe: 'Les Salutations - Cách Chào Hỏi Trong Tiếng Pháp',
      level: 'A1',
      chuDe: 'VOCABULARY',
      thoiGianDoc: 10,
      isPublish: true,
      anhBia: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=70',
      sections: [
        {
          loai: 'TEXT',
          noiDung: JSON.stringify({ content: 'Trong tiếng Pháp, có nhiều cách chào hỏi khác nhau tùy theo thời điểm trong ngày và mức độ thân thiết. Hãy cùng học các câu chào hỏi cơ bản nhất!' }),
          thuTu: 0,
        },
        {
          loai: 'VOCABULARY',
          noiDung: JSON.stringify({
            title: 'Từ vựng chào hỏi',
            words: [
              { tuPhap: 'Bonjour', phatAm: '/bɔ̃ʒuʁ/', nghiaViet: 'Xin chào (ban ngày)', audioUrl: null },
              { tuPhap: 'Bonsoir', phatAm: '/bɔ̃swaʁ/', nghiaViet: 'Chào buổi tối', audioUrl: null },
              { tuPhap: 'Salut', phatAm: '/saly/', nghiaViet: 'Chào (thân mật)', audioUrl: null },
              { tuPhap: 'Au revoir', phatAm: '/oʁvwaʁ/', nghiaViet: 'Tạm biệt', audioUrl: null },
              { tuPhap: 'Bonne nuit', phatAm: '/bɔn nɥi/', nghiaViet: 'Chúc ngủ ngon', audioUrl: null },
            ],
          }),
          thuTu: 1,
        },
        {
          loai: 'MINI_QUIZ',
          noiDung: JSON.stringify({
            cauHoi: 'Câu nào dùng để chào vào buổi tối?',
            luaChon: [
              { kyHieu: 'A', noiDung: 'Bonjour' },
              { kyHieu: 'B', noiDung: 'Bonsoir' },
              { kyHieu: 'C', noiDung: 'Au revoir' },
              { kyHieu: 'D', noiDung: 'Salut' },
            ],
            dapAnDung: 'B',
          }),
          thuTu: 2,
        },
      ],
    },
    {
      slug: 'les-verbes-chia-dong-tu-nhom-1',
      tieuDe: 'Les Verbes - Chia Động Từ Nhóm 1',
      level: 'A1',
      chuDe: 'GRAMMAR',
      thoiGianDoc: 15,
      isPublish: true,
      anhBia: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=70',
      sections: [
        {
          loai: 'TEXT',
          noiDung: JSON.stringify({ content: 'Động từ nhóm 1 là nhóm lớn nhất trong tiếng Pháp, kết thúc bằng -ER. Đây là cách chia động từ "parler" (nói) làm ví dụ.' }),
          thuTu: 0,
        },
        {
          loai: 'GRAMMAR',
          noiDung: JSON.stringify({
            title: 'Chia động từ PARLER (nói)',
            giaiThich: 'Động từ kết thúc bằng -ER chia theo quy tắc: bỏ -ER, thêm đuôi tương ứng',
            viDuPhap: 'Je parle / Tu parles / Il parle / Nous parlons / Vous parlez / Ils parlent',
            viDuCau: '"Je parle français." - Tôi nói tiếng Pháp.',
            dichNghia: 'Đuôi: -e, -es, -e, -ons, -ez, -ent',
          }),
          thuTu: 1,
        },
      ],
    },
    {
      slug: 'ecouter-luyen-nghe-hoi-thoai',
      tieuDe: 'Écouter - Luyện Nghe Hội Thoại Thực Tế',
      level: 'A2',
      chuDe: 'LISTENING',
      thoiGianDoc: 20,
      isPublish: true,
      anhBia: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=70',
      sections: [
        {
          loai: 'TEXT',
          noiDung: JSON.stringify({ content: 'Luyện nghe là kỹ năng quan trọng. Hãy nghe đoạn hội thoại dưới đây và trả lời câu hỏi.' }),
          thuTu: 0,
        },
        {
          loai: 'VIDEO',
          noiDung: JSON.stringify({ id: 'dQw4w9WgXcQ', title: 'Hội thoại tiếng Pháp cơ bản' }),
          thuTu: 1,
        },
      ],
    },
    {
      slug: 'la-famille-tu-vung-gia-dinh',
      tieuDe: 'La Famille - Từ Vựng Về Gia Đình',
      level: 'A1',
      chuDe: 'VOCABULARY',
      thoiGianDoc: 12,
      isPublish: true,
      anhBia: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=600&q=70',
      sections: [
        {
          loai: 'VOCABULARY',
          noiDung: JSON.stringify({
            title: 'Thành viên trong gia đình',
            words: [
              { tuPhap: 'le père', phatAm: '/pɛʁ/', nghiaViet: 'Người cha', audioUrl: null },
              { tuPhap: 'la mère', phatAm: '/mɛʁ/', nghiaViet: 'Người mẹ', audioUrl: null },
              { tuPhap: 'le frère', phatAm: '/fʁɛʁ/', nghiaViet: 'Anh/em trai', audioUrl: null },
              { tuPhap: 'la sœur', phatAm: '/sœʁ/', nghiaViet: 'Chị/em gái', audioUrl: null },
              { tuPhap: 'les grands-parents', phatAm: '/gʁɑ̃paʁɑ̃/', nghiaViet: 'Ông bà', audioUrl: null },
            ],
          }),
          thuTu: 0,
        },
      ],
    },
    {
      slug: 'les-nombres-dem-so-tieng-phap',
      tieuDe: 'Les Nombres - Đếm Số Trong Tiếng Pháp',
      level: 'A1',
      chuDe: 'VOCABULARY',
      thoiGianDoc: 8,
      isPublish: true,
      anhBia: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=70',
      sections: [
        {
          loai: 'VOCABULARY',
          noiDung: JSON.stringify({
            title: 'Số từ 1-20',
            words: [
              { tuPhap: 'un / une', phatAm: '/œ̃/yn/', nghiaViet: 'Một', audioUrl: null },
              { tuPhap: 'deux', phatAm: '/dø/', nghiaViet: 'Hai', audioUrl: null },
              { tuPhap: 'trois', phatAm: '/tʁwa/', nghiaViet: 'Ba', audioUrl: null },
              { tuPhap: 'dix', phatAm: '/dis/', nghiaViet: 'Mười', audioUrl: null },
              { tuPhap: 'vingt', phatAm: '/vɛ̃/', nghiaViet: 'Hai mươi', audioUrl: null },
            ],
          }),
          thuTu: 0,
        },
      ],
    },
    {
      slug: 'les-couleurs-mau-sac',
      tieuDe: 'Les Couleurs - Màu Sắc Trong Tiếng Pháp',
      level: 'A1',
      chuDe: 'VOCABULARY',
      thoiGianDoc: 10,
      isPublish: true,
      anhBia: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=70',
      sections: [
        {
          loai: 'VOCABULARY',
          noiDung: JSON.stringify({
            title: 'Các màu sắc cơ bản',
            words: [
              { tuPhap: 'rouge', phatAm: '/ʁuʒ/', nghiaViet: 'Đỏ', audioUrl: null },
              { tuPhap: 'bleu', phatAm: '/blø/', nghiaViet: 'Xanh dương', audioUrl: null },
              { tuPhap: 'vert', phatAm: '/vɛʁ/', nghiaViet: 'Xanh lá', audioUrl: null },
              { tuPhap: 'jaune', phatAm: '/ʒon/', nghiaViet: 'Vàng', audioUrl: null },
              { tuPhap: 'noir', phatAm: '/nwaʁ/', nghiaViet: 'Đen', audioUrl: null },
              { tuPhap: 'blanc', phatAm: '/blɑ̃/', nghiaViet: 'Trắng', audioUrl: null },
            ],
          }),
          thuTu: 0,
        },
      ],
    },
  ]

  for (const lesson of lessons) {
    const { sections, ...lessonData } = lesson
    const existing = await prisma.lesson.findUnique({ where: { slug: lessonData.slug } })
    if (!existing) {
      await prisma.lesson.create({
        data: {
          ...lessonData,
          sections: { create: sections },
        },
      })
      console.log(`✅ Lesson: ${lessonData.tieuDe}`)
    } else {
      console.log(`⏭️  Lesson exists: ${lessonData.tieuDe}`)
    }
  }

  // ── FLASHCARD DECKS ────────────────────────────────────────────────
  const decks = [
    {
      tieuDe: 'Les Salutations - Cách Chào Hỏi Cơ Bản',
      moTa: 'Học các câu chào hỏi thông dụng trong tiếng Pháp',
      level: 'A1',
      isPublish: true,
      cards: [
        { tuPhap: 'Bonjour', nghiaViet: 'Xin chào (ban ngày)', phatAm: '/bɔ̃ʒuʁ/', viDu: 'Bonjour, comment allez-vous?' },
        { tuPhap: 'Bonsoir', nghiaViet: 'Chào buổi tối', phatAm: '/bɔ̃swaʁ/', viDu: 'Bonsoir, monsieur!' },
        { tuPhap: 'Salut', nghiaViet: 'Chào (thân mật)', phatAm: '/saly/', viDu: 'Salut, ça va?' },
        { tuPhap: 'Au revoir', nghiaViet: 'Tạm biệt', phatAm: '/oʁvwaʁ/', viDu: 'Au revoir, à demain!' },
        { tuPhap: 'Merci', nghiaViet: 'Cảm ơn', phatAm: '/mɛʁsi/', viDu: 'Merci beaucoup!' },
        { tuPhap: "S'il vous plaît", nghiaViet: 'Làm ơn / Xin hãy', phatAm: '/silvuplɛ/', viDu: "Un café, s'il vous plaît." },
        { tuPhap: 'Excusez-moi', nghiaViet: 'Xin lỗi', phatAm: '/ɛkskyze mwa/', viDu: 'Excusez-moi, où est la gare?' },
        { tuPhap: 'Comment vous appelez-vous?', nghiaViet: 'Bạn tên là gì? (lịch sự)', phatAm: '/kɔmɑ̃ vuzaple vu/', viDu: null },
        { tuPhap: "Je m'appelle...", nghiaViet: 'Tôi tên là...', phatAm: "/ʒə mapɛl/", viDu: "Je m'appelle Marie." },
        { tuPhap: 'Enchanté(e)', nghiaViet: 'Rất vui được gặp', phatAm: '/ɑ̃ʃɑ̃te/', viDu: 'Enchanté de vous rencontrer.' },
      ],
    },
    {
      tieuDe: 'Les Verbes Du 1er Groupe - Chia Động Từ Nhóm 1',
      moTa: 'Ôn tập chia động từ kết thúc bằng -ER',
      level: 'A1',
      isPublish: true,
      cards: [
        { tuPhap: 'parler', nghiaViet: 'Nói', phatAm: '/paʁle/', viDu: 'Je parle français.' },
        { tuPhap: 'manger', nghiaViet: 'Ăn', phatAm: '/mɑ̃ʒe/', viDu: 'Nous mangeons ensemble.' },
        { tuPhap: 'aimer', nghiaViet: 'Yêu thích', phatAm: '/ɛme/', viDu: "J'aime le chocolat." },
        { tuPhap: 'travailler', nghiaViet: 'Làm việc', phatAm: '/tʁavaje/', viDu: 'Il travaille beaucoup.' },
        { tuPhap: 'habiter', nghiaViet: 'Sống ở / Cư trú', phatAm: '/abite/', viDu: "J'habite à Paris." },
        { tuPhap: 'étudier', nghiaViet: 'Học tập', phatAm: '/etydje/', viDu: "Elle étudie le français." },
        { tuPhap: 'regarder', nghiaViet: 'Nhìn / Xem', phatAm: '/ʁəɡaʁde/', viDu: 'Je regarde la télévision.' },
        { tuPhap: 'écouter', nghiaViet: 'Nghe', phatAm: '/ekute/', viDu: "Nous écoutons de la musique." },
        { tuPhap: 'chanter', nghiaViet: 'Hát', phatAm: '/ʃɑ̃te/', viDu: 'Elle chante très bien.' },
        { tuPhap: 'danser', nghiaViet: 'Nhảy múa', phatAm: '/dɑ̃se/', viDu: 'Vous dansez le tango?' },
      ],
    },
    {
      tieuDe: 'Écouter Et Comprendre - Luyện Nghe Hội Thoại',
      moTa: 'Từ vựng thường gặp trong hội thoại thực tế',
      level: 'A2',
      isPublish: true,
      cards: [
        { tuPhap: 'Allons-y!', nghiaViet: 'Đi thôi!', phatAm: '/alɔ̃zi/', viDu: 'Allons-y, on est en retard!' },
        { tuPhap: "Qu'est-ce que c'est?", nghiaViet: 'Cái này là gì?', phatAm: '/kɛskəsɛ/', viDu: null },
        { tuPhap: 'Je ne comprends pas', nghiaViet: 'Tôi không hiểu', phatAm: '/ʒə nə kɔ̃pʁɑ̃ pa/', viDu: null },
        { tuPhap: 'Pouvez-vous répéter?', nghiaViet: 'Bạn có thể nhắc lại không?', phatAm: '/puvevuʁepete/', viDu: null },
        { tuPhap: "C'est combien?", nghiaViet: 'Cái này bao nhiêu tiền?', phatAm: '/sɛ kɔ̃bjɛ̃/', viDu: "C'est combien, ce livre?" },
      ],
    },
  ]

  for (const deck of decks) {
    const { cards, ...deckData } = deck
    const existing = await prisma.flashcardDeck.findFirst({ where: { tieuDe: deckData.tieuDe } })
    if (!existing) {
      await prisma.flashcardDeck.create({
        data: {
          ...deckData,
          flashcards: { create: cards },
        },
      })
      console.log(`✅ Deck: ${deckData.tieuDe}`)
    } else {
      console.log(`⏭️  Deck exists: ${deckData.tieuDe}`)
    }
  }

  // ── EXAMS ──────────────────────────────────────────────────────────
  const exams = [
    {
      tieuDe: 'Đề Luyện Tập A1 - Số 1',
      moTa: 'Kiểm tra từ vựng và ngữ pháp cơ bản cấp A1',
      level: 'A1',
      thoiGianLam: 20,
      isPublish: true,
      questions: [
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: '"Bonjour" có nghĩa là gì?',
          giaiThich: 'Bonjour = Xin chào, dùng vào ban ngày',
          thuTu: 0,
          answers: [
            { noiDung: 'Tạm biệt', laDapAnDung: false },
            { noiDung: 'Xin chào', laDapAnDung: true },
            { noiDung: 'Cảm ơn', laDapAnDung: false },
            { noiDung: 'Xin lỗi', laDapAnDung: false },
          ],
        },
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: 'Điền vào chỗ trống: "Je ___ français." (parler)',
          giaiThich: 'Với chủ ngữ "Je", động từ "parler" chia thành "parle"',
          thuTu: 1,
          answers: [
            { noiDung: 'parles', laDapAnDung: false },
            { noiDung: 'parlons', laDapAnDung: false },
            { noiDung: 'parle', laDapAnDung: true },
            { noiDung: 'parlez', laDapAnDung: false },
          ],
        },
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: '"La famille" có nghĩa là gì?',
          thuTu: 2,
          answers: [
            { noiDung: 'Thành phố', laDapAnDung: false },
            { noiDung: 'Gia đình', laDapAnDung: true },
            { noiDung: 'Trường học', laDapAnDung: false },
            { noiDung: 'Công việc', laDapAnDung: false },
          ],
        },
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: 'Số "vingt" trong tiếng Pháp là số mấy?',
          thuTu: 3,
          answers: [
            { noiDung: '10', laDapAnDung: false },
            { noiDung: '12', laDapAnDung: false },
            { noiDung: '15', laDapAnDung: false },
            { noiDung: '20', laDapAnDung: true },
          ],
        },
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: '"Rouge" là màu gì?',
          thuTu: 4,
          answers: [
            { noiDung: 'Xanh', laDapAnDung: false },
            { noiDung: 'Vàng', laDapAnDung: false },
            { noiDung: 'Đỏ', laDapAnDung: true },
            { noiDung: 'Trắng', laDapAnDung: false },
          ],
        },
      ],
    },
    {
      tieuDe: 'Đề Luyện Tập A1 - Số 2',
      moTa: 'Kiểm tra chào hỏi và giao tiếp cơ bản',
      level: 'A1',
      thoiGianLam: 15,
      isPublish: true,
      questions: [
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: 'Câu nào dùng để hỏi tên?',
          thuTu: 0,
          answers: [
            { noiDung: 'Comment allez-vous?', laDapAnDung: false },
            { noiDung: 'Comment vous appelez-vous?', laDapAnDung: true },
            { noiDung: "Où habitez-vous?", laDapAnDung: false },
            { noiDung: 'Quel âge avez-vous?', laDapAnDung: false },
          ],
        },
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: '"Merci beaucoup" có nghĩa là gì?',
          thuTu: 1,
          answers: [
            { noiDung: 'Xin chào', laDapAnDung: false },
            { noiDung: 'Tạm biệt', laDapAnDung: false },
            { noiDung: 'Cảm ơn rất nhiều', laDapAnDung: true },
            { noiDung: 'Không có gì', laDapAnDung: false },
          ],
        },
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: 'Trong tiếng Pháp, "le père" nghĩa là gì?',
          thuTu: 2,
          answers: [
            { noiDung: 'Người mẹ', laDapAnDung: false },
            { noiDung: 'Người anh', laDapAnDung: false },
            { noiDung: 'Người cha', laDapAnDung: true },
            { noiDung: 'Người ông', laDapAnDung: false },
          ],
        },
      ],
    },
    {
      tieuDe: 'Đề Luyện Tập A2 - Số 1',
      moTa: 'Kiểm tra ngữ pháp và từ vựng cấp A2',
      level: 'A2',
      thoiGianLam: 30,
      isPublish: true,
      questions: [
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: 'Chọn dạng đúng: "Nous ___ (manger) au restaurant."',
          giaiThich: 'Động từ "manger" với "nous" chia thành "mangeons" (thêm -e trước -ons)',
          thuTu: 0,
          answers: [
            { noiDung: 'mangez', laDapAnDung: false },
            { noiDung: 'mangeons', laDapAnDung: true },
            { noiDung: 'mangent', laDapAnDung: false },
            { noiDung: 'manges', laDapAnDung: false },
          ],
        },
        {
          loai: 'MULTIPLE_CHOICE',
          noiDung: '"Je ne comprends pas" có nghĩa là gì?',
          thuTu: 1,
          answers: [
            { noiDung: 'Tôi hiểu rồi', laDapAnDung: false },
            { noiDung: 'Tôi không nghe', laDapAnDung: false },
            { noiDung: 'Tôi không hiểu', laDapAnDung: true },
            { noiDung: 'Tôi không nói được', laDapAnDung: false },
          ],
        },
      ],
    },
  ]

  for (const exam of exams) {
    const { questions, ...examData } = exam
    const existing = await prisma.exam.findFirst({ where: { tieuDe: examData.tieuDe } })
    if (!existing) {
      await prisma.exam.create({
        data: {
          ...examData,
          questions: {
            create: questions.map((q) => ({
              ...q,
              answers: { create: q.answers },
            })),
          },
        },
      })
      console.log(`✅ Exam: ${examData.tieuDe}`)
    } else {
      console.log(`⏭️  Exam exists: ${examData.tieuDe}`)
    }
  }

  console.log('\n🎉 Seed completed!')
  await prisma.$disconnect()
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
