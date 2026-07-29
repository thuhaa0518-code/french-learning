# Cấu trúc Database - FrenchGo

## Công nghệ
- Database: PostgreSQL trên Supabase
- ORM: Prisma (file schema: prisma/schema.prisma)
- Tất cả ID: CUID - dùng @default(cuid()) trong Prisma
- Tên bảng SQL: snake_case (vd: lesson_progresses)
- Tên field Prisma: camelCase map xuống snake_case

---

## Danh sách bảng và cột (từ SQL schema thực tế)

### Bảng: users
Lưu thông tin người dùng, đồng bộ từ Clerk qua webhook.
Cột:
- id           : NVARCHAR(30) PK
- clerk_id     : NVARCHAR(100) NOT NULL - ID từ Clerk, dùng để tìm user
- email        : NVARCHAR(255) NOT NULL UNIQUE
- ten_hien_thi : NVARCHAR(200) NOT NULL - tên hiển thị
- vai_tro      : NVARCHAR(10) DEFAULT 'STUDENT' - giá trị: STUDENT hoặc ADMIN

### Bảng: videos
Lưu video giải đề từ YouTube.
Cột:
- id         : NVARCHAR(30) PK
- tieu_de    : NVARCHAR(300) NOT NULL
- youtube_id : NVARCHAR(20) NOT NULL - ID video YouTube (vd: dQw4w9WgXcQ)
- mo_ta      : NVARCHAR(MAX) NULL
- level      : NVARCHAR(5) NULL - A1, A2, B1, B2
- is_publish : BIT DEFAULT 0 - 0=ẩn, 1=hiện

### Bảng: lessons
Lưu bài học.
Cột:
- id             : NVARCHAR(30) PK
- slug           : NVARCHAR(120) NOT NULL UNIQUE - URL thân thiện (vd: bai-1-chao-hoi)
- tieu_de        : NVARCHAR(300) NOT NULL
- level          : NVARCHAR(5) NOT NULL - A1, A2, B1, B2
- chu_de         : NVARCHAR(20) NOT NULL - VOCABULARY, GRAMMAR, LISTENING, READING
- anh_bia        : NVARCHAR(500) NULL - URL ảnh bìa
- thoi_gian_doc  : INT DEFAULT 5 - phút đọc ước tính
- is_publish     : BIT DEFAULT 0

### Bảng: lesson_sections
Lưu các khối nội dung trong bài học.
FK: lesson_id → lessons.id (ON DELETE CASCADE)
Cột:
- id        : NVARCHAR(30) PK
- lesson_id : NVARCHAR(30) FK → lessons.id
- loai      : NVARCHAR(20) NOT NULL - TEXT, VOCABULARY, GRAMMAR, VIDEO, MINI_QUIZ, EXERCISE
- noi_dung  : NVARCHAR(MAX) NOT NULL - nội dung JSON theo từng loại
- thu_tu    : INT DEFAULT 0 - thứ tự hiển thị
### Cấu trúc JSON của cột noi_dung trong lesson_sections

Loại VAN_BAN:
{
  "content": "Đoạn văn bản nội dung bài học..."
}

Loại TU_VUNG:
{
  "title": "Từ vựng bài học - Les Salutations",
  "words": [
    {
      "tu_phap": "Bonjour",
      "phat_am": "/bɔ̃ʒuʁ/",
      "nghia_viet": "Xin chào (ban ngày)",
      "audio_url": "https://..."
    },
    {
      "tu_phap": "Bonsoir",
      "phat_am": "/bɔ̃swaʁ/",
      "nghia_viet": "Chào buổi tối",
      "audio_url": null
    }
  ]
}

Loại NGU_PHAP:
{
  "title": "Ngữ pháp",
  "giai_thich": "Cách hỏi thăm - Comment allez-vous ?",
  "vi_du_phap": "Comment allez-vous ? / Comment vas-tu ?",
  "vi_du_cau": "\"Bonjour ! Comment allez-vous ?\"",
  "dich_nghia": "\"Xin chào! Bạn có khỏe không?\" (lịch sự)"
}

Loại MINI_QUIZ:
{
  "cau_hoi": "Câu nào dùng để chào vào buổi tối?",
  "lua_chon": [
    { "ky_hieu": "A", "noi_dung": "Bonsoir" },
    { "ky_hieu": "B", "noi_dung": "Bonjour" },
    { "ky_hieu": "C", "noi_dung": "Au revoir" },
    { "ky_hieu": "D", "noi_dung": "Salut" }
  ],
  "dap_an_dung": "A"
}

### Bảng: lesson_progresses
Lưu tiến độ đọc bài của từng học viên.
UNIQUE: (user_id, lesson_id) - mỗi học viên 1 tiến độ/bài
Cột:
- id              : NVARCHAR(30) PK
- user_id         : NVARCHAR(30) FK → users.id
- lesson_id       : NVARCHAR(30) FK → lessons.id
- phan_tram       : INT DEFAULT 0 - 0 đến 100
- da_hoan_thanh   : BIT DEFAULT 0 - tự động = 1 khi phan_tram >= 80

### Bảng: flashcard_decks
Lưu bộ thẻ flashcard.
Cột:
- id         : NVARCHAR(30) PK
- tieu_de    : NVARCHAR(200) NOT NULL
- mo_ta      : NVARCHAR(500) NULL
- level      : NVARCHAR(5) NULL - A1, A2, B1, B2
- is_publish : BIT DEFAULT 0

### Bảng: flashcards
Lưu từng thẻ từ vựng.
FK: deck_id → flashcard_decks.id (ON DELETE CASCADE)
Cột:
- id          : NVARCHAR(30) PK
- deck_id     : NVARCHAR(30) FK → flashcard_decks.id
- tu_phap     : NVARCHAR(200) NOT NULL - từ tiếng Pháp (mặt trước)
- nghia_viet  : NVARCHAR(200) NOT NULL - nghĩa tiếng Việt (mặt sau)
- phat_am     : NVARCHAR(100) NULL - phiên âm IPA
- vi_du       : NVARCHAR(500) NULL - câu ví dụ
- audio_url   : NVARCHAR(500) NULL - URL file audio trên Supabase Storage

### Bảng: flashcard_states
Lưu trạng thái ôn tập SM-2 của từng học viên với từng thẻ.
UNIQUE: (user_id, flashcard_id) - mỗi học viên 1 trạng thái/thẻ
Cột:
- id            : NVARCHAR(30) PK
- user_id       : NVARCHAR(30) FK → users.id
- flashcard_id  : NVARCHAR(30) FK → flashcards.id
- so_ngay_nhac_lai   : INT DEFAULT 1 - khoảng cách ôn tập (ngày), tham số SM-2
- danh_gia_cuoi : NVARCHAR(10) NULL - De, Kho, Lam_lai

### Bảng: exams
Lưu đề thi.
Cột:
- id             : NVARCHAR(30) PK
- tieu_de        : NVARCHAR(300) NOT NULL
- mo_ta          : NVARCHAR(MAX) NULL
- level          : NVARCHAR(5) NOT NULL - A1, A2, B1, B2
- thoi_gian_lam  : INT DEFAULT 45 - phút làm bài
- is_publish     : BIT DEFAULT 0
- video_id       : NVARCHAR(30) NULL FK → videos.id - video giải đề, tùy chọn

### Bảng: questions
Lưu câu hỏi trong đề thi.
FK: exam_id → exams.id (ON DELETE CASCADE)
Cột:
- id         : NVARCHAR(30) PK
- exam_id    : NVARCHAR(30) FK → exams.id
- loai       : NVARCHAR(20) NOT NULL - MULTIPLE_CHOICE
- noi_dung   : NVARCHAR(MAX) NOT NULL - nội dung câu hỏi
- giai_thich : NVARCHAR(MAX) NULL - giải thích đáp án, hiện sau khi nộp bài
- thu_tu     : INT DEFAULT 0

### Bảng: answers
Lưu các lựa chọn đáp án cho từng câu hỏi.
FK: question_id → questions.id (ON DELETE CASCADE)
Cột:
- id              : NVARCHAR(30) PK
- question_id     : NVARCHAR(30) FK → questions.id
- noi_dung        : NVARCHAR(500) NOT NULL - nội dung lựa chọn
- la_dap_an_dung  : BIT DEFAULT 0 - 1 = đây là đáp án đúng (chỉ 1 cái/câu)

### Bảng: exam_attempts
Lưu mỗi lượt làm bài của học viên.
Cột:
- id              : NVARCHAR(30) PK
- user_id         : NVARCHAR(30) FK → users.id
- exam_id         : NVARCHAR(30) FK → exams.id
- diem_so         : FLOAT NULL - NULL khi đang làm, 0-100 sau khi nộp
- da_do           : BIT DEFAULT 0 - đã làm xong chưa
- thoi_gian_lam   : INT DEFAULT 0 - số giây thực tế đã làm
- da_nop          : BIT DEFAULT 0 - đã nộp chưa
- thoi_gian_nop   : DATETIME2 NULL - thời điểm nộp bài

### Bảng: attempt_answers
Lưu câu trả lời chi tiết của học viên trong mỗi lượt làm bài.
UNIQUE: (attempt_id, question_id) - 1 câu trả lời/câu hỏi/lượt
Cột:
- id             : NVARCHAR(30) PK
- attempt_id     : NVARCHAR(30) FK → exam_attempts.id
- question_id    : NVARCHAR(30) FK → questions.id
- cau_tra_loi    : NVARCHAR(500) NULL - câu trả lời của học viên
- la_dung        : BIT DEFAULT 0 - 1 = trả lời đúng
- diem_dat_duoc  : INT DEFAULT 0 - điểm đạt được cho câu này

---

## Quan hệ quan trọng (để generate code đúng)
- users 1:N lesson_progresses (unique per lesson)
- users 1:N exam_attempts
- users 1:N flashcard_states (unique per flashcard)
- lessons 1:N lesson_sections (CASCADE delete)
- flashcard_decks 1:N flashcards (CASCADE delete)
- exams 1:N questions (CASCADE delete)
- questions 1:N answers (CASCADE delete)
- exam_attempts 1:N attempt_answers (CASCADE delete)
- videos 0..1:1 exams (SET NULL khi xóa video)

---

## Logic nghiệp vụ quan trọng

### Hoàn thành bài học
Khi cập nhật lesson_progresses: nếu phan_tram >= 80 và da_hoan_thanh = 0
→ đặt da_hoan_thanh = 1

### Chấm điểm bài thi (QUAN TRỌNG - làm server-side)
- Không bao giờ trả la_dap_an_dung về cho client khi đang làm bài
- Chỉ trả về sau khi học viên đã nộp
- diem_so = (số câu đúng / tổng câu) * 100, làm tròn

### SM-2 Flashcard
Sau khi học viên đánh giá thẻ, cập nhật so_ngay_nhac_lai:
- Lam_lai → so_ngay_nhac_lai = 1
- Kho  → so_ngay_nhac_lai = so_ngay_nhac_lai * 1.5
- De  → so_ngay_nhac_lai = so_ngay_nhac_lai * 2.5
Ngày ôn tiếp theo = hôm nay + so_ngay_nhac_lai ngày