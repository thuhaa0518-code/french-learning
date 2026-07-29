# Implementation Plan: FrenchGo Platform

## Overview

Triển khai toàn bộ nền tảng FrenchGo từ hạ tầng cốt lõi (Prisma schema, auth helpers, API response helpers, middleware) đến các module chức năng (Lesson System, Flashcard SM-2, Exam System, Dashboard, Admin Panel). Mỗi bước build dần lên bước trước, kết thúc bằng việc nối tất cả các thành phần lại với nhau.

---

## Tasks

- [x] 1. Thiết lập hạ tầng cốt lõi và cấu hình dự án
  - Cấu hình `tsconfig.json` với `strict: true`, `paths` alias `@/*`
  - Tạo `prisma/schema.prisma` với đầy đủ các model: User, Video, Lesson, LessonSection, LessonProgress, FlashcardDeck, Flashcard, FlashcardState, Exam, Question, Answer, ExamAttempt, AttemptAnswer
  - Bao gồm tất cả `@@unique`, `@@map`, `@map`, quan hệ FK và `onDelete: Cascade`
  - Tạo `lib/prisma.ts` theo Prisma singleton pattern để tránh connection pool exhaustion
  - Tạo `types/index.ts` với các kiểu dùng chung: `UserRole`, `LessonLevel`, `LessonTopic`, `SectionType`, `FlashcardRating` và các JSON content types
  - Tạo file `.env.local` mẫu liệt kê tất cả biến môi trường bắt buộc
  - _Requirements: 13.1, 13.2, 13.3_


- [x] 2. Xây dựng thư viện tiện ích và helpers cốt lõi
  - [x] 2.1 Tạo `lib/api-response.ts` với helpers `ok<T>()` và `err()`
    - Implement `ApiSuccess<T>` và `ApiError` types
    - `ok()` trả về `{ success: true, data }` với status 200
    - `err()` trả về `{ success: false, error: { code, message } }` với HTTP status tương ứng
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 2.2 Viết property test cho API response helpers
    - **Property 14: Mọi API thành công trả về đúng cấu trúc `{ success: true, data }`**
    - **Property 15: Mọi API lỗi trả về đúng cấu trúc `{ success: false, error }`**
    - **Validates: Requirements 12.1, 12.2**

  - [x] 2.3 Tạo `lib/slug.ts` với hàm `generateSlug(tieuDe: string): string`
    - Chuyển unicode tiếng Việt sang ASCII, lowercase, replace spaces thành hyphens
    - Xóa ký tự đặc biệt, truncate về 120 ký tự, không có double hyphens
    - _Requirements: 3.10, 8.2_

  - [ ]* 2.4 Viết property test cho slug generator
    - **Property 5: `generateSlug` luôn tạo ra slug hợp lệ cho mọi tiêu đề**
    - Dùng `fc.string({ minLength: 1 })` với 200 iterations (fast-check)
    - **Validates: Requirements 3.10, 8.2**

  - [x] 2.5 Tạo `lib/sm2.ts` với các pure functions SM-2
    - `computeNextInterval(current: number, rating: FlashcardRating): number`
    - `getNextReviewDate(updatedAt: Date, interval: number): Date`
    - `isDueForReview(updatedAt: Date, interval: number, now: Date): boolean`
    - _Requirements: 5.4, 5.5, 5.6, 5.8_

  - [ ]* 2.6 Viết property tests cho SM-2 algorithm
    - **Property 6: `computeNextInterval` tính đúng interval cho mọi đánh giá**
    - **Property 7: `isDueForReview` xác định đúng thẻ cần ôn cho mọi trạng thái**
    - Dùng `fc.integer({ min: 1, max: 365 })` và `fc.constantFrom('Lam_lai', 'Kho', 'De')` với 200 iterations
    - **Validates: Requirements 5.4, 5.5, 5.6, 5.8**

  - [x] 2.7 Tạo `lib/auth.ts` với helpers: `getCurrentUser()`, `requireAuth()`, `requireAdmin()`
    - Dùng `auth()` từ `@clerk/nextjs/server` để lấy userId
    - Query DB qua `clerk_id` để trả về User record
    - `requireAuth()` throw 401 nếu chưa đăng nhập; `requireAdmin()` throw 403 nếu không phải ADMIN
    - _Requirements: 1.6, 12.6_

  - [x] 2.8 Tạo `lib/validations/` với Zod schemas
    - `lesson.ts`: `CreateLessonSchema`, `UpdateLessonSchema`, `SectionSchema`
    - `flashcard.ts`: `CreateDeckSchema`, `UpdateDeckSchema`, `CreateCardSchema`, `UpdateCardSchema`
    - `exam.ts`: `CreateExamSchema`, `CreateQuestionSchema`, `SubmitAnswersSchema`
    - `user.ts`: `UpdateProfileSchema`, `UpdateRoleSchema`
    - _Requirements: 8.6, 9.6, 10.5, 12.4_

  - [ ]* 2.9 Viết property test cho Zod validation schemas
    - **Property 13: Validation từ chối mọi input sai schema**
    - Test `CreateLessonSchema` với level không hợp lệ, tiêu đề rỗng
    - **Validates: Requirements 4.6, 8.6, 9.6, 10.5, 12.4**


  - [x] 2.10 Tạo `lib/exam-grader.ts` với pure function `computeDiemSo(correct: number, total: number): number`
    - Tính `ROUND((correct / total) * 100, 2)`, trả về số trong [0, 100]
    - _Requirements: 6.7_

  - [ ]* 2.11 Viết property test cho công thức tính điểm thi
    - **Property 9: Công thức tính điểm đúng cho mọi kết quả**
    - Dùng `fc.integer({ min: 1, max: 100 }).chain(...)` để sinh cặp (total, correct)
    - **Validates: Requirements 6.7**

- [ ] 3. Cấu hình Root Layout, Middleware và xác thực Clerk
  - [x] 3.1 Cập nhật `app/layout.tsx` với Exo font (next/font/google), ClerkProvider, Tailwind globals
    - Import Exo với weights 300–800, set `--font-exo` CSS variable
    - Wrap toàn bộ app trong `<ClerkProvider>`
    - _Requirements: 14.1_

  - [x] 3.2 Tạo `middleware.ts` tại root với Clerk Edge Middleware và RBAC
    - Dùng `clerkMiddleware` và `createRouteMatcher` từ `@clerk/nextjs/server`
    - `isAdminRoute`: `/admin(.*)`, `/api/admin(.*)`
    - `isStudentRoute`: `/dashboard(.*)`, `/flashcard/(.*)`, `/ket-qua(.*)`, `/api/tien-do(.*)`, `/api/flashcard/on-tap`, `/api/flashcard/danh-gia`, `/api/luot-lam(.*)`, `/api/nguoi-dung/toi`
    - Đọc `vai_tro` từ `sessionClaims.publicMetadata` — không query DB
    - Admin route: redirect `/` nếu không phải ADMIN; Student route: redirect `/sign-in` nếu chưa đăng nhập
    - Export `config.matcher` với pattern loại trừ static files
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.3 Viết unit tests cho Middleware RBAC logic
    - Test redirect khi truy cập `/admin` không có ADMIN role
    - Test redirect khi truy cập `/dashboard` chưa đăng nhập
    - Test public routes cho phép truy cập tự do
    - **Property 11 (unit examples): Middleware từ chối mọi request không có quyền**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 4. Checkpoint — Đảm bảo tất cả tests pass và schema hợp lệ
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có câu hỏi.


- [x] 5. Clerk Webhook và đồng bộ người dùng
  - [x] 5.1 Tạo `app/api/webhooks/clerk/route.ts`
    - Verify Svix signature từ headers; trả về 400 nếu thất bại (không modify data)
    - Xử lý `user.created`: INSERT vào `users` với cuid, clerk_id, email, ten_hien_thi, vai_tro = "STUDENT"
    - Xử lý `user.updated`: UPDATE ten_hien_thi và email theo clerk_id
    - Xử lý `user.deleted`: DELETE user theo clerk_id
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 5.2 Viết unit tests cho Clerk webhook handler
    - Mock Svix verification: test reject khi signature sai (HTTP 400)
    - Test user.created tạo đúng record với vai_tro = "STUDENT"
    - Test user.updated chỉ cập nhật ten_hien_thi và email
    - Test user.deleted xóa đúng record
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Hệ thống bài học — API Routes
  - [x] 6.1 Tạo `app/api/bai-hoc/route.ts` cho GET (public) và POST (admin)
    - `GET`: Trả về chỉ bài học `is_publish = true`; hỗ trợ filter query `?level=`, `?chu_de=`, `?search=` trên `tieu_de`
    - `POST` (ADMIN): Validate với `CreateLessonSchema`, auto-generate slug, INSERT lesson + sections trong transaction; trả 409 CONFLICT nếu slug trùng
    - Gọi `revalidatePath('/bai-hoc')` sau khi tạo bài học được publish
    - _Requirements: 3.1, 3.3, 3.4, 3.10, 8.2, 8.6, 8.7_

  - [ ]* 6.2 Viết property test cho lesson filtering
    - **Property 1: Chỉ nội dung đã xuất bản mới được trả về từ public endpoints**
    - **Property 2: Mọi kết quả lọc bài học phải thỏa mãn tất cả tiêu chí bộ lọc**
    - **Validates: Requirements 3.3, 3.4**

  - [x] 6.3 Tạo `app/api/bai-hoc/[id]/route.ts` cho PUT và DELETE (admin)
    - `PUT`: Validate input, update lesson fields, replace sections (delete cũ + insert mới), gọi `revalidatePath` sau khi toggle `is_publish`
    - `DELETE`: Cascade delete lesson_sections và lesson_progresses qua Prisma
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ]* 6.4 Viết unit tests cho lesson sections ordering
    - **Property 3 (unit examples): Sections luôn sắp xếp theo thu_tu tăng dần**
    - Test trả về 409 khi slug trùng
    - Test cascade delete xóa sections liên quan
    - **Validates: Requirements 3.5, 8.5**


- [ ] 7. Hệ thống bài học — Pages và Components
  - [x] 7.1 Tạo `app/(public)/bai-hoc/page.tsx` (ISR, revalidate 300s)
    - Server Component fetch bài học is_publish = true với filter từ searchParams
    - Render `LessonCard` component cho mỗi bài học
    - Render `LessonFilter` Client Component cho filter tương tác
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 7.2 Tạo `app/(public)/bai-hoc/[slug]/page.tsx` (ISR, revalidate 300s)
    - Fetch lesson + sections (orderBy thu_tu asc) theo slug
    - Trả 404 nếu slug không tồn tại
    - Render `SectionRenderer` Server Component cho từng section theo loai
    - Nhúng `LessonProgressBar` Client Component cho Student đã đăng nhập
    - _Requirements: 3.2, 3.5, 3.6, 3.7, 3.9_

  - [x] 7.3 Tạo `components/lesson/SectionRenderer.tsx` (Server Component)
    - Switch theo `section.loai`: TEXT → TextBlock, VOCABULARY → VocabularyTable, GRAMMAR → GrammarBlock, VIDEO → YouTubeEmbed, MINI_QUIZ → MiniQuiz (client), EXERCISE → ExerciseBlock
    - Parse `noi_dung` JSON với type safety
    - _Requirements: 3.6_

  - [x] 7.4 Tạo `components/lesson/LessonProgressBar.tsx` (Client Component)
    - Track scroll position, tính phan_tram
    - Debounce 2s → POST `/api/tien-do` với lesson_id và phan_tram
    - Màu progress bar: `#CB30E0`
    - _Requirements: 3.7, 3.8, 14.2_

  - [x] 7.5 Tạo `components/lesson/MiniQuiz.tsx` (Client Component, "use client")
    - Nhận `MiniQuizContent` props, hiển thị câu hỏi và lựa chọn
    - State: selected answer, show result sau khi submit
    - Framer Motion animate khi reveal đáp án
    - _Requirements: 3.6, 14.5, 14.8_

- [x] 8. API tiến độ bài học
  - [x] 8.1 Tạo `app/api/tien-do/route.ts`
    - `POST` (Student): Validate `{ lesson_id, phan_tram: 0-100 }` với Zod; trả 422 nếu phan_tram ngoài range
    - UPSERT vào `lesson_progresses` theo (user_id, lesson_id)
    - Nếu phan_tram >= 80 và da_hoan_thanh = false → set da_hoan_thanh = true trong cùng transaction
    - Trả 404 nếu lesson_id không tồn tại
    - `GET` (Student): Trả về tất cả lesson_progress records của user hiện tại
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 8.2 Viết property test cho lesson completion logic
    - **Property 4: `da_hoan_thanh = true` khi và chỉ khi `phan_tram >= 80`**
    - Dùng `fc.integer({ min: 0, max: 100 })` với 101 iterations
    - **Validates: Requirements 3.8, 4.2**

  - [ ]* 8.3 Viết property test cho data isolation
    - **Property 12: Dữ liệu tiến độ chỉ trả về cho đúng chủ sở hữu**
    - Mock hai users và kiểm tra GET không cross-contaminate data
    - **Validates: Requirements 4.4**


- [x] 9. Hệ thống Flashcard — API Routes
  - [x] 9.1 Tạo `app/api/flashcard/bo-the/route.ts` và `[id]/route.ts`
    - `GET /bo-the` (Public): Trả về decks có `is_publish = true`, filter by level và search
    - `GET /bo-the/[id]` (Public): Chi tiết deck + danh sách flashcards
    - `POST /bo-the` (Admin): Validate với `CreateDeckSchema`, tạo deck mới
    - `DELETE /bo-the/[id]` (Admin): Cascade delete flashcards và flashcard_states
    - _Requirements: 5.1, 9.1, 9.2, 9.5_

  - [ ]* 9.2 Viết unit test cho flashcard deck publish filtering
    - **Property 1 (deck variant): Chỉ deck is_publish = true được trả về**
    - Test cascade delete xóa flashcards và states liên quan
    - **Validates: Requirements 5.1, 9.5**

  - [x] 9.3 Tạo `app/api/flashcard/the/route.ts` và `[id]/route.ts`
    - `POST /the` (Admin): Validate `CreateCardSchema`, thêm flashcard vào deck
    - `PUT /the/[id]` (Admin): Validate `UpdateCardSchema`, cập nhật tu_phap, nghia_viet, phat_am, vi_du, audio_url
    - `DELETE /the/[id]` (Admin): Xóa flashcard đơn lẻ
    - _Requirements: 9.3, 9.4, 9.6_

  - [x] 9.4 Tạo `app/api/flashcard/on-tap/route.ts` (Student)
    - Query tất cả flashcard_states của user hiện tại
    - Filter: `isDueForReview(state.updatedAt, state.soNgayNhacLai, new Date()) === true`
    - Include flashcard data, sort theo ngày ôn tập sớm nhất
    - _Requirements: 5.8_

  - [x] 9.5 Tạo `app/api/flashcard/danh-gia/route.ts` (Student)
    - Validate `{ flashcard_id, danh_gia: 'De'|'Kho'|'Lam_lai' }` với Zod
    - Trả 404 nếu flashcard_id không tồn tại
    - Gọi `computeNextInterval()` từ `lib/sm2.ts`
    - UPSERT vào `flashcard_states` (user_id, flashcard_id) với soNgayNhacLai mới và danhGiaCuoi
    - Trả về `{ nextReviewDate }`
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.9, 5.10_

- [x] 10. Hệ thống Flashcard — Pages và Components
  - [x] 10.1 Tạo `app/(public)/flashcard/page.tsx` (ISR, revalidate 300s)
    - Server Component fetch published decks, filter by level/search từ searchParams
    - Render DeckCard components
    - _Requirements: 5.1_

  - [x] 10.2 Tạo `app/(student)/flashcard/[id]/page.tsx` (Client Component, SSR)
    - Import và render `StudySession` Client Component với deck data
    - _Requirements: 5.2, 5.3_

  - [x] 10.3 Tạo `components/flashcard/FlashcardFlip.tsx` (Client Component, "use client")
    - State: `isFlipped` boolean
    - Framer Motion: `rotateY 0→180` (front) và `rotateY 180→0` (back)
    - Mặt trước: `tu_phap`; Mặt sau: `nghia_viet` + `phat_am` + nút audio nếu có `audio_url`
    - Phát audio từ Supabase Storage khi click nút
    - _Requirements: 5.2, 5.3, 14.5, 14.8_

  - [x] 10.4 Tạo `components/flashcard/RatingButtons.tsx` (Client Component)
    - 3 nút: "Dễ" (#55BE24), "Khó" (#F51A1A), "Làm lại" (#CB30E0)
    - Gọi POST `/api/flashcard/danh-gia` khi click
    - Framer Motion animate transition
    - _Requirements: 5.4, 5.5, 5.6, 14.4, 14.5_

  - [x] 10.5 Tạo `components/flashcard/StudySession.tsx` (Client Component)
    - Fetch review queue từ `/api/flashcard/on-tap`
    - Quản lý state: current card index, session progress
    - Orchestrate `FlashcardFlip` và `RatingButtons`
    - Hiển thị kết quả cuối session
    - _Requirements: 5.2, 5.7, 5.8_

- [x] 11. Checkpoint — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có câu hỏi.


- [x] 12. Hệ thống đề thi — API Routes
  - [x] 12.1 Tạo `app/api/de-thi/route.ts` (GET public, POST admin)
    - `GET`: Trả về danh sách exams có `is_publish = true` với title, level, thoi_gian_lam, description
    - `POST` (Admin): Validate `CreateExamSchema`, tạo exam với video_id tùy chọn
    - _Requirements: 6.1, 10.2_

  - [x] 12.2 Tạo `app/api/de-thi/[id]/route.ts` (GET public, DELETE admin)
    - `GET`: Fetch exam + questions + answers; dùng Prisma `select` để LOẠI BỎ `laDapAnDung` khỏi response
    - `DELETE` (Admin): Cascade delete questions, answers, exam_attempts, attempt_answers
    - _Requirements: 6.2, 10.4_

  - [ ]* 12.3 Viết property test cho answer hiding
    - **Property 8: `laDapAnDung` không bao giờ xuất hiện trong response GET /api/de-thi/[id]**
    - Kiểm tra toàn bộ cấu trúc JSON lồng nhau không có field này
    - **Validates: Requirements 6.2**

  - [x] 12.4 Tạo `app/api/de-thi/[id]/cau-hoi/route.ts` (POST admin)
    - Validate `CreateQuestionSchema`: loai, noi_dung, giai_thich?, thu_tu, dap_an array
    - Enforce: đúng một đáp án có `la_dap_an_dung = true` (trả 422 nếu vi phạm)
    - Insert question + answers trong transaction
    - _Requirements: 10.3_

  - [x] 12.5 Tạo `app/api/luot-lam/route.ts` (POST student)
    - Validate `{ exam_id }`, kiểm tra exam tồn tại và `is_publish = true`
    - Tạo `exam_attempts` record với `da_nop = false`
    - Trả về `{ attempt_id }`
    - _Requirements: 6.3, 6.11_

  - [x] 12.6 Tạo `app/api/luot-lam/[id]/nop/route.ts` (POST student)
    - Kiểm tra attempt tồn tại và `da_nop = false`; trả 409 CONFLICT nếu đã nộp
    - Fetch questions + answers với `la_dap_an_dung` từ DB (server-side only)
    - Chấm điểm: so sánh từng `cau_tra_loi` với đáp án đúng
    - Gọi `computeDiemSo(correct, total)` từ `lib/exam-grader.ts`
    - Batch INSERT `attempt_answers` với `la_dung` và `diem_dat_duoc`
    - UPDATE `exam_attempts`: set `diem_so`, `da_nop = true`, `thoi_gian_nop`
    - Trả về `{ diem_so, chi_tiet: [{ question_id, la_dung, dap_an_dung }] }`
    - _Requirements: 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ]* 12.7 Viết property tests cho exam grading response
    - **Property 9: `computeDiemSo` luôn trong [0,100] và khớp công thức**
    - **Property 10: Response chấm điểm chứa đủ chi_tiet cho mọi câu hỏi**
    - **Validates: Requirements 6.7, 6.9**

- [x] 13. Hệ thống đề thi — Pages và Components
  - [x] 13.1 Tạo `app/(public)/de-thi/page.tsx` (ISR, revalidate 300s)
    - Server Component fetch published exams
    - Render `ExamCard` với title, level, thoi_gian_lam, description
    - _Requirements: 6.1_

  - [x] 13.2 Tạo `app/(public)/de-thi/[id]/page.tsx` (SSR)
    - Server Component: gọi POST `/api/luot-lam` để tạo attempt khi Student bắt đầu
    - Nhúng `CountdownTimer` Client Component với `thoiGianLam` minutes
    - Nhúng `QuestionList` Client Component cho làm bài
    - _Requirements: 6.3, 6.4_

  - [x] 13.3 Tạo `components/exam/CountdownTimer.tsx` (Client Component, "use client")
    - Props: `thoiGianLam: number` (minutes), `onExpire: () => void`
    - State: remaining seconds; `setInterval` mỗi 1s
    - Hiển thị MM:SS; màu đỏ khi remaining < 60s
    - Gọi `onExpire()` khi remaining === 0 (auto-submit)
    - _Requirements: 6.4, 6.5, 14.8_

  - [x] 13.4 Tạo `components/exam/QuestionList.tsx` (Client Component)
    - Hiển thị tất cả câu hỏi với radio buttons cho mỗi đáp án
    - Manage state: `answers: Record<questionId, answerId>`
    - Nút "Nộp bài" gọi POST `/api/luot-lam/[id]/nop`
    - Khi timer expire, tự động submit với answers hiện tại
    - _Requirements: 6.5, 6.6_

  - [x] 13.5 Tạo `app/(student)/ket-qua/[id]/page.tsx` (SSR no-cache)
    - Fetch attempt result với chi_tiet per-question
    - Render `ResultDetail` Server Component
    - Hiển thị video YouTube nếu exam có `video_id`
    - _Requirements: 6.9, 6.12_

  - [x] 13.6 Tạo `components/exam/ResultDetail.tsx` (Server Component)
    - Hiển thị diem_so, số câu đúng/tổng
    - Hiển thị per-question: câu hỏi, câu trả lời của student, đáp án đúng, la_dung
    - Framer Motion animate khi reveal từng câu
    - _Requirements: 6.9_


- [x] 14. Dashboard học viên
  - [x] 14.1 Tạo `app/(student)/dashboard/page.tsx` (SSR, no-cache)
    - `export const dynamic = 'force-dynamic'`
    - Parallel fetch với `Promise.all`: lesson_progresses, exam_attempts (daNop=true), flashcard_states
    - Tính: completed lessons (da_hoan_thanh=1), in-progress (0 < phan_tram < 80), not started
    - Filter flashcard_states để đếm thẻ due today
    - Render `ProgressSummary`, `ExamHistory`, `FlashcardStats` components
    - Render empty state nếu không có hoạt động học tập
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

  - [x] 14.2 Tạo `components/dashboard/ProgressSummary.tsx`
    - Hiển thị số bài học theo từng trạng thái với color coding:
      - Hoàn thành: `#55BE24`, Đang học: `#0088FF`, Chưa bắt đầu: `#5B5B5B`
    - Progress bar với màu `#CB30E0`
    - _Requirements: 7.2, 7.5, 14.2, 14.3_

  - [x] 14.3 Tạo `components/dashboard/ExamHistory.tsx`
    - Hiển thị danh sách exam attempts: title, diem_so, thoi_gian_nop, link tới kết quả
    - _Requirements: 7.3_

  - [x] 14.4 Tạo `components/dashboard/FlashcardStats.tsx`
    - Hiển thị số deck đang học và số thẻ due for review hôm nay
    - _Requirements: 7.4_

- [x] 15. Admin Panel — Quản lý bài học
  - [x] 15.1 Tạo `app/admin/layout.tsx` với kiểm tra ADMIN role (SSR)
    - Gọi `requireAdmin()` từ `lib/auth.ts`; redirect `/` nếu không phải ADMIN
    - Admin navigation sidebar
    - `export const dynamic = 'force-dynamic'`
    - _Requirements: 2.2, 11.4_

  - [x] 15.2 Tạo `app/admin/bai-hoc/page.tsx` (SSR no-cache)
    - Fetch tất cả lessons (published và unpublished)
    - Render bảng với title, level, status, action buttons (sửa/xóa/toggle publish)
    - _Requirements: 8.1_

  - [ ] 15.3 Tạo `app/admin/bai-hoc/tao-moi/page.tsx` và form component
    - Form tạo bài học: tieu_de, level, chu_de, anh_bia, thoi_gian_doc
    - Dynamic section builder: thêm/xóa/sắp xếp sections theo loai
    - Submit gọi POST `/api/bai-hoc`; hiển thị validation errors
    - _Requirements: 8.2, 8.6_

  - [x] 15.4 Tạo `app/admin/bai-hoc/[id]/chinh-sua/page.tsx` và form
    - Pre-fill form với lesson data hiện tại
    - Submit gọi PUT `/api/bai-hoc/[id]`; gọi revalidatePath khi toggle publish
    - _Requirements: 8.3, 8.4_


- [x] 16. Admin Panel — Quản lý Flashcard và Đề thi
  - [x] 16.1 Tạo `app/admin/flashcard/page.tsx` và `[id]/page.tsx` (SSR no-cache)
    - Danh sách tất cả decks với title, level, card count, publish status
    - Chi tiết deck: danh sách flashcards với form thêm/sửa/xóa từng thẻ
    - _Requirements: 9.1_

  - [x] 16.2 Tạo `app/admin/de-thi/page.tsx` và `[id]/page.tsx` (SSR no-cache)
    - Danh sách tất cả exams với title, level, question count, thoi_gian_lam, publish status
    - Chi tiết exam: danh sách câu hỏi với form thêm câu hỏi và đáp án
    - Enforce UI: đúng một đáp án được đánh dấu `la_dap_an_dung = true`
    - _Requirements: 10.1, 10.3_

- [x] 17. Admin Panel — Quản lý người dùng và thống kê
  - [x] 17.1 Tạo `app/api/admin/nguoi-dung/route.ts` (GET admin)
    - Paginated list of all users, hỗ trợ `?search=` (name/email) và `?vai_tro=` filter
    - _Requirements: 11.1_

  - [x] 17.2 Tạo `app/api/admin/nguoi-dung/[id]/vai-tro/route.ts` (PUT admin)
    - Validate `{ vai_tro: 'STUDENT'|'ADMIN' }`
    - UPDATE `users.vai_tro` trong DB
    - Gọi `clerkClient.users.updateUser(clerkId, { publicMetadata: { vai_tro } })` để sync Clerk
    - _Requirements: 11.2_

  - [x] 17.3 Tạo `app/admin/nguoi-dung/page.tsx` (SSR no-cache)
    - Danh sách users với pagination, search/filter
    - Dropdown để thay đổi vai_tro
    - _Requirements: 11.1, 11.2_

  - [x] 17.4 Tạo `app/admin/thong-ke/page.tsx` (SSR no-cache)
    - Aggregate stats: total users, published lessons, published exams, completed lessons (across all users), exam attempts submitted
    - _Requirements: 11.3, 11.4_

- [x] 18. Shared Components và UI
  - [x] 18.1 Tạo `components/shared/Navbar.tsx` (Server Component)
    - Navigation với Clerk UserButton
    - Responsive với mobile/tablet/desktop breakpoints
    - Font Exo, màu primary `#CB30E0`
    - _Requirements: 14.1, 14.6, 14.7_

  - [x] 18.2 Tạo `components/shared/LevelBadge.tsx`, `EmptyState.tsx`
    - `LevelBadge`: hiển thị A1/A2/B1/B2 badge với màu tương ứng
    - `EmptyState`: component tái sử dụng cho trạng thái trống
    - _Requirements: 7.6_

  - [x] 18.3 Tạo `lib/supabase-server.ts` với `supabaseAdmin` và `supabasePublic` clients
    - `supabaseAdmin` dùng `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
    - `supabasePublic` dùng `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - _Requirements: 13.4, 13.5_

  - [x] 18.4 Tạo `app/api/admin/upload/route.ts` cho file upload
    - Nhận file qua FormData, validate type (image/*, audio/*) và size (5MB/2MB)
    - Upload qua `supabaseAdmin.storage` vào bucket `french-media`
    - Trả về public URL theo pattern chuẩn
    - _Requirements: 13.4, 13.5_

  - [x] 18.5 Tạo pages `/sign-in` và `/sign-up` với Clerk components
    - `app/(public)/sign-in/[[...sign-in]]/page.tsx`
    - `app/(public)/sign-up/[[...sign-up]]/page.tsx`
    - _Requirements: 1.6_


- [x] 19. Tích hợp và nối dây toàn bộ hệ thống
  - [x] 19.1 Cập nhật `app/layout.tsx` để tích hợp đầy đủ: ClerkProvider, Exo font, Navbar, Tailwind globals
    - Đảm bảo `--font-exo` CSS variable hoạt động xuyên suốt
    - _Requirements: 14.1, 14.6, 14.7_

  - [x] 19.2 Tạo `app/(public)/page.tsx` (trang chủ, ISR revalidate 300s)
    - Hero section, giới thiệu các cấp độ CEFR, CTA đến bai-hoc và de-thi
    - Responsive layout cho mobile/tablet/desktop
    - _Requirements: 14.6_

  - [x] 19.3 Cấu hình Tailwind với màu brand và font Exo
    - Extend theme: `colors.primary = '#CB30E0'`, color tokens cho trạng thái lesson/flashcard
    - `fontFamily.exo` mapping tới `var(--font-exo)`
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ]* 19.4 Viết property tests cho auth enforcement (integration)
    - **Property 11: Middleware từ chối mọi request không có quyền đến protected routes**
    - **Property 16: Mọi student/admin API route trả về 401 khi thiếu auth**
    - **Validates: Requirements 2.2, 2.3, 12.6**

  - [ ]* 19.5 Viết integration tests cho grading flow và SM-2 state
    - Test POST `/api/luot-lam/[id]/nop` end-to-end: tạo attempt → nộp bài → verify DB state
    - Test POST `/api/flashcard/danh-gia` end-to-end: UPSERT flashcard_states với SM-2 interval đúng
    - Test PUT `/api/admin/nguoi-dung/[id]/vai-tro`: sync cả DB và Clerk
    - _Requirements: 6.6, 6.7, 6.8, 5.7, 11.2_

- [ ] 20. Checkpoint cuối — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có câu hỏi.


---

## Notes

- Tasks đánh dấu `*` là tùy chọn và có thể bỏ qua để phát triển MVP nhanh hơn
- Mỗi task tham chiếu đến requirements cụ thể để truy vết
- Property tests dùng thư viện **fast-check** với tag format: `// Feature: frenchgo-platform, Property {N}: {description}`
- Mỗi property test chạy tối thiểu **200 iterations**
- Integration tests cần database PostgreSQL riêng (test DB), không dùng production
- Tất cả API routes phải wrap trong `try/catch` và xử lý Prisma error codes (P2002, P2025, P2003)
- `"use client"` chỉ áp dụng cho: FlashcardFlip, StudySession, RatingButtons, CountdownTimer, QuestionList, MiniQuiz, LessonProgressBar, LessonFilter
- Tất cả các component còn lại là Server Component mặc định

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.3", "2.5", "2.7", "2.8", "2.10"] },
    { "id": 1, "tasks": ["2.2", "2.4", "2.6", "2.9", "2.11", "3.1", "3.2"] },
    { "id": 2, "tasks": ["3.3", "5.1", "6.1", "8.1", "9.1", "9.3", "12.1", "12.2", "12.5", "18.3"] },
    { "id": 3, "tasks": ["5.2", "6.2", "6.3", "8.2", "8.3", "9.2", "9.4", "9.5", "12.3", "12.4", "12.6", "17.1", "17.2", "18.4", "18.5"] },
    { "id": 4, "tasks": ["6.4", "12.7", "7.1", "7.2", "7.3", "7.4", "7.5", "10.1", "10.2", "13.1", "13.2", "13.5", "14.1", "15.1", "16.1", "16.2", "17.3", "17.4", "18.1", "18.2"] },
    { "id": 5, "tasks": ["10.3", "10.4", "10.5", "13.3", "13.4", "13.6", "14.2", "14.3", "14.4", "15.2", "15.3", "15.4"] },
    { "id": 6, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 7, "tasks": ["19.4", "19.5"] }
  ]
}
```
