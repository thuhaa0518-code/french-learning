# Tài liệu Yêu cầu — FrenchGo Platform

## Giới thiệu

FrenchGo là nền tảng học tiếng Pháp trực tuyến dành cho học sinh và sinh viên Việt Nam. Hệ thống hỗ trợ 4 cấp độ A1, A2, B1, B2 theo khung CEFR, cung cấp đầy đủ bài học, flashcard với thuật toán SM-2, đề thi trắc nghiệm có tính giờ và dashboard theo dõi tiến độ cá nhân. Toàn bộ nền tảng được xây dựng bằng Next.js 15 (App Router), TypeScript strict, Tailwind CSS + Shadcn UI, Prisma + PostgreSQL (Supabase), xác thực Clerk và deploy trên Vercel.

---

## Bảng thuật ngữ (Glossary)

- **Platform**: Hệ thống FrenchGo — toàn bộ ứng dụng web
- **Student**: Học viên — người dùng với vai_tro = "STUDENT", truy cập trang học và dashboard
- **Admin**: Quản trị viên — người dùng với vai_tro = "ADMIN", có toàn quyền quản lý nội dung
- **Clerk_Webhook**: Dịch vụ xử lý sự kiện từ Clerk, đồng bộ người dùng vào DB
- **Lesson_System**: Module quản lý và hiển thị bài học
- **Flashcard_System**: Module ôn tập từ vựng theo thuật toán SM-2
- **Exam_System**: Module thi trắc nghiệm có tính giờ và chấm điểm server-side
- **Dashboard**: Trang tổng hợp tiến độ và kết quả học tập của Student
- **Admin_Panel**: Khu vực quản trị dành riêng cho Admin
- **SM2_Algorithm**: Thuật toán lập lịch ôn tập thích nghi dựa trên đánh giá của học viên
- **ISR**: Incremental Static Regeneration — chiến lược rendering cho trang công khai
- **SSR**: Server-Side Rendering — chiến lược rendering cho trang riêng tư
- **Middleware**: Lớp kiểm tra xác thực và phân quyền chạy tại Vercel Edge
- **Slug**: Chuỗi URL thân thiện, duy nhất, tự sinh từ tiêu đề bài học
- **CUID**: Định danh duy nhất được sinh bởi Prisma (@default(cuid()))
- **Zod**: Thư viện validate schema cho dữ liệu đầu vào từ client
- **Lesson_Section**: Khối nội dung con trong bài học (văn bản, từ vựng, ngữ pháp, mini quiz, v.v.)
- **Flashcard_Deck**: Bộ thẻ từ vựng gồm nhiều Flashcard
- **Exam_Attempt**: Một lượt làm bài thi của Student
- **Attempt_Answer**: Câu trả lời chi tiết của Student trong một Exam_Attempt

---

## Yêu cầu

### Yêu cầu 1: Xác thực người dùng qua Clerk

**User Story:** Là một người dùng, tôi muốn đăng ký và đăng nhập an toàn qua Clerk, để tôi có thể truy cập nội dung phù hợp với vai trò của mình.

#### Tiêu chí chấp nhận

1. WHEN a user registers via Clerk, THE Clerk_Webhook SHALL receive a `user.created` event and insert a new record into the users table with fields: id (CUID), clerk_id, email, ten_hien_thi, and vai_tro = "STUDENT".
2. WHEN a user updates their profile in Clerk, THE Clerk_Webhook SHALL receive a `user.updated` event and update the corresponding ten_hien_thi and email fields in the users table matched by clerk_id.
3. WHEN a user is deleted from Clerk, THE Clerk_Webhook SHALL receive a `user.deleted` event and remove the corresponding record from the users table matched by clerk_id.
4. THE Clerk_Webhook SHALL verify every incoming request using the Svix signature before processing any event.
5. IF the Svix signature verification fails, THEN THE Clerk_Webhook SHALL return HTTP 400 and reject the request without modifying any data.
6. WHEN a user submits a valid login via Clerk, THE Platform SHALL issue a JWT session cookie and grant access to routes permitted for the user's vai_tro.

---

### Yêu cầu 2: Phân quyền và kiểm soát truy cập (Middleware)

**User Story:** Là một quản trị viên hệ thống, tôi muốn đảm bảo mỗi người dùng chỉ truy cập được trang phù hợp với vai trò, để bảo vệ nội dung quản trị và dữ liệu riêng tư.

#### Tiêu chí chấp nhận

1. THE Middleware SHALL run at Vercel Edge Runtime and evaluate every request before it reaches the application server.
2. WHEN a request targets `/admin/*` or `/api/admin/*`, THE Middleware SHALL verify that the authenticated user has vai_tro = "ADMIN"; IF the condition is not met, THEN THE Middleware SHALL redirect the request to `/`.
3. WHEN a request targets `/dashboard/*`, `/flashcard/*`, `/ket-qua/*`, or `/api/tien-do/*`, THE Middleware SHALL verify that the user is authenticated; IF the user is not authenticated, THEN THE Middleware SHALL redirect the request to `/sign-in`.
4. WHEN a request targets `/`, `/bai-hoc/*`, `/de-thi/*`, `/sign-in`, or `/sign-up`, THE Middleware SHALL allow access without authentication.
5. THE Middleware SHALL read the vai_tro value from the Clerk JWT claims to perform role checks without an additional database query.

---

### Yêu cầu 3: Hệ thống bài học (Lesson System)

**User Story:** Là một học viên, tôi muốn xem danh sách và nội dung bài học theo cấp độ CEFR, để tôi có thể tự học tiếng Pháp theo lộ trình phù hợp.

#### Tiêu chí chấp nhận

1. THE Lesson_System SHALL render the lesson list page (`/bai-hoc`) using ISR with a revalidation interval of 300 seconds.
2. THE Lesson_System SHALL render individual lesson pages (`/bai-hoc/[slug]`) using ISR with a revalidation interval of 300 seconds.
3. WHEN a visitor accesses `/bai-hoc`, THE Lesson_System SHALL display only lessons where is_publish = 1.
4. WHEN a visitor provides query parameters, THE Lesson_System SHALL filter lessons by level (A1, A2, B1, B2), chu_de (VOCABULARY, GRAMMAR, LISTENING, READING), and/or keyword search against tieu_de.
5. WHEN a visitor accesses `/bai-hoc/[slug]`, THE Lesson_System SHALL retrieve the lesson record together with all associated lesson_sections ordered by thu_tu ascending.
6. THE Lesson_System SHALL render each Lesson_Section according to its loai: TEXT as formatted prose, VOCABULARY as a word list with phat_am and nghia_viet, GRAMMAR as an explanation block with vi_du_phap and vi_du_cau, VIDEO as an embedded YouTube player, MINI_QUIZ as an interactive single-question quiz, and EXERCISE as a practice activity.
7. WHILE a Student is viewing a lesson, THE Lesson_System SHALL track reading progress and send a POST request to `/api/tien-do` with the current phan_tram value as the Student scrolls.
8. WHEN phan_tram reaches or exceeds 80, THE Lesson_System SHALL set da_hoan_thanh = 1 for that lesson_progress record via server-side logic.
9. IF a lesson slug does not exist in the database, THEN THE Lesson_System SHALL return a 404 Not Found response.
10. THE Lesson_System SHALL auto-generate a unique slug from tieu_de when a new lesson is created, and SHALL reject creation with a CONFLICT error if the generated slug already exists.

---

### Yêu cầu 4: Tiến độ bài học

**User Story:** Là một học viên, tôi muốn hệ thống lưu và hiển thị tiến độ đọc từng bài học, để tôi biết mình đã học đến đâu.

#### Tiêu chí chấp nhận

1. WHEN a Student sends a POST request to `/api/tien-do` with a valid lesson_id and phan_tram (0–100), THE Platform SHALL upsert a record in lesson_progresses for the (user_id, lesson_id) pair.
2. WHEN the upserted phan_tram is greater than or equal to 80 and da_hoan_thanh is currently 0, THE Platform SHALL set da_hoan_thanh = 1 in the same transaction.
3. THE Platform SHALL enforce a UNIQUE constraint on (user_id, lesson_id) in lesson_progresses so that each Student has exactly one progress record per lesson.
4. WHEN a Student sends a GET request to `/api/tien-do`, THE Platform SHALL return all lesson_progress records belonging to the authenticated user.
5. IF the lesson_id provided in the POST body does not reference an existing lesson, THEN THE Platform SHALL return a NOT_FOUND error.
6. IF the phan_tram value is outside the range 0–100, THEN THE Platform SHALL return a VALIDATION_ERROR.

---

### Yêu cầu 5: Hệ thống Flashcard với thuật toán SM-2

**User Story:** Là một học viên, tôi muốn ôn tập từ vựng theo lịch thông minh dựa trên mức độ khó của từng thẻ, để việc ghi nhớ trở nên hiệu quả hơn.

#### Tiêu chí chấp nhận

1. THE Flashcard_System SHALL display the list of published flashcard decks at `/flashcard` with filtering by level (A1, A2, B1, B2) and keyword search.
2. WHEN a Student opens a flashcard deck, THE Flashcard_System SHALL render each flashcard as a flippable card showing tu_phap (front) and nghia_viet with phat_am (back) using a Client Component.
3. WHEN a Student plays audio on a flashcard with a non-null audio_url, THE Flashcard_System SHALL play the audio file from Supabase Storage.
4. WHEN a Student rates a flashcard as "Lam_lai", THE SM2_Algorithm SHALL set so_ngay_nhac_lai = 1.
5. WHEN a Student rates a flashcard as "Kho", THE SM2_Algorithm SHALL set so_ngay_nhac_lai = FLOOR(current so_ngay_nhac_lai × 1.5), minimum 1 day.
6. WHEN a Student rates a flashcard as "De", THE SM2_Algorithm SHALL set so_ngay_nhac_lai = FLOOR(current so_ngay_nhac_lai × 2.5), minimum 1 day.
7. AFTER the SM2_Algorithm updates so_ngay_nhac_lai, THE Platform SHALL upsert a record in flashcard_states for the (user_id, flashcard_id) pair and record danh_gia_cuoi.
8. WHEN a Student accesses the review session (`/api/flashcard/on-tap`), THE Flashcard_System SHALL return only flashcards whose next review date (last update date + so_ngay_nhac_lai days) is on or before the current date.
9. THE Platform SHALL enforce a UNIQUE constraint on (user_id, flashcard_id) in flashcard_states so that each Student has exactly one state record per flashcard.
10. IF a flashcard_id provided during rating does not exist, THEN THE Platform SHALL return a NOT_FOUND error.

---

### Yêu cầu 6: Hệ thống đề thi trắc nghiệm

**User Story:** Là một học viên, tôi muốn làm bài thi trắc nghiệm có giới hạn thời gian và nhận kết quả ngay sau khi nộp, để kiểm tra kiến thức tiếng Pháp của mình.

#### Tiêu chí chấp nhận

1. WHEN a visitor accesses `/de-thi`, THE Exam_System SHALL display all published exams (is_publish = 1) with their title, level, thoi_gian_lam, and description.
2. WHEN a visitor accesses `/de-thi/[id]`, THE Exam_System SHALL return the exam data including all questions and answer options, but SHALL NOT include the la_dap_an_dung field in the response.
3. WHEN a Student initiates an exam by sending POST to `/api/luot-lam` with a valid exam_id, THE Exam_System SHALL create a new exam_attempts record with da_nop = 0 and return the attempt_id.
4. WHILE a Student is taking an exam, THE Exam_System SHALL display a countdown timer initialized to thoi_gian_lam minutes using a Client Component.
5. WHEN the countdown timer reaches zero, THE Exam_System SHALL automatically submit the Student's current answers to `/api/luot-lam/[id]/nop`.
6. WHEN a Student submits answers to `/api/luot-lam/[id]/nop`, THE Exam_System SHALL perform server-side grading by comparing each cau_tra_loi against the correct answer identified by la_dap_an_dung = 1 in the database.
7. WHEN server-side grading is complete, THE Exam_System SHALL compute diem_so = ROUND((correct_count / total_questions) × 100, 2) and persist the result in exam_attempts.
8. WHEN server-side grading is complete, THE Exam_System SHALL persist each attempt_answer record with la_dung and diem_dat_duoc and update da_nop = 1 and thoi_gian_nop in exam_attempts.
9. WHEN the grading response is returned to the client, THE Exam_System SHALL include diem_so and the per-question chi_tiet array containing question_id, la_dung, and the correct answer text.
10. IF a Student attempts to submit answers for an attempt_id that is already marked da_nop = 1, THEN THE Exam_System SHALL return a CONFLICT error.
11. IF an exam_id provided to POST `/api/luot-lam` does not reference a published exam, THEN THE Exam_System SHALL return a NOT_FOUND error.
12. WHERE an exam has an associated video_id, THE Exam_System SHALL display the linked YouTube video on the result page after grading.

---

### Yêu cầu 7: Dashboard học viên

**User Story:** Là một học viên, tôi muốn xem tổng quan tiến độ học tập và lịch sử thi của mình, để theo dõi kết quả và lập kế hoạch học.

#### Tiêu chí chấp nhận

1. THE Dashboard SHALL render using SSR with no-cache headers to always show the latest personal data of the authenticated Student.
2. WHEN a Student accesses `/dashboard`, THE Dashboard SHALL display the total number of lessons completed (da_hoan_thanh = 1), the total number of lessons in progress, and the number of lessons not yet started.
3. WHEN a Student accesses `/dashboard`, THE Dashboard SHALL display the Student's exam history including exam title, diem_so, thoi_gian_nop, and a link to the detailed result page for each completed attempt.
4. WHEN a Student accesses `/dashboard`, THE Dashboard SHALL display the number of flashcard decks in progress and the count of flashcards due for review today.
5. THE Dashboard SHALL display lesson progress indicators using color coding: completed (da_hoan_thanh = 1) as #55BE24, in-progress (0 < phan_tram < 80) as #0088FF, and not started as #5B5B5B.
6. IF the authenticated Student has no learning activity, THEN THE Dashboard SHALL display an empty-state message encouraging the Student to start their first lesson.

---

### Yêu cầu 8: Trang Admin — Quản lý bài học

**User Story:** Là một quản trị viên, tôi muốn tạo, chỉnh sửa, và xuất bản bài học cùng các khối nội dung, để cung cấp tài liệu học cho học viên.

#### Tiêu chí chấp nhận

1. WHEN an Admin accesses `/admin/bai-hoc`, THE Admin_Panel SHALL render a list of all lessons (published and unpublished) using SSR.
2. WHEN an Admin creates a new lesson via POST `/api/bai-hoc`, THE Admin_Panel SHALL accept tieu_de, level, chu_de, optional anh_bia URL, optional thoi_gian_doc, and an array of sections; THE Platform SHALL auto-generate a unique slug from tieu_de.
3. WHEN an Admin updates a lesson via PUT `/api/bai-hoc/[id]`, THE Admin_Panel SHALL allow modification of all lesson fields and replacement of lesson_sections.
4. WHEN an Admin toggles is_publish to 1 on a lesson, THE Platform SHALL call revalidatePath('/bai-hoc') to invalidate the ISR cache.
5. WHEN an Admin deletes a lesson via DELETE `/api/bai-hoc/[id]`, THE Platform SHALL cascade delete all associated lesson_sections and lesson_progresses records.
6. THE Admin_Panel SHALL validate all lesson creation and update input using Zod schemas before processing the request.
7. IF a slug conflict is detected during lesson creation, THEN THE Platform SHALL return a CONFLICT error with code "CONFLICT".

---

### Yêu cầu 9: Trang Admin — Quản lý Flashcard

**User Story:** Là một quản trị viên, tôi muốn tạo và quản lý bộ thẻ từ vựng, để cung cấp nội dung ôn tập cho học viên.

#### Tiêu chí chấp nhận

1. WHEN an Admin accesses `/admin/flashcard`, THE Admin_Panel SHALL display all flashcard decks with their title, level, card count, and publish status.
2. WHEN an Admin creates a flashcard deck via POST `/api/flashcard/bo-the`, THE Platform SHALL accept tieu_de, optional mo_ta, optional level, and is_publish flag.
3. WHEN an Admin adds a card to a deck via POST `/api/flashcard/the`, THE Platform SHALL accept deck_id, tu_phap, nghia_viet, optional phat_am, optional vi_du, and optional audio_url pointing to Supabase Storage.
4. WHEN an Admin updates a flashcard via PUT `/api/flashcard/the/[id]`, THE Admin_Panel SHALL allow modification of tu_phap, nghia_viet, phat_am, vi_du, and audio_url.
5. WHEN an Admin deletes a flashcard deck via DELETE `/api/flashcard/bo-the/[id]`, THE Platform SHALL cascade delete all associated flashcards and flashcard_states records.
6. THE Admin_Panel SHALL validate all flashcard creation and update input using Zod schemas before processing.

---

### Yêu cầu 10: Trang Admin — Quản lý đề thi

**User Story:** Là một quản trị viên, tôi muốn tạo và quản lý đề thi trắc nghiệm với câu hỏi và đáp án, để học viên có thể luyện thi.

#### Tiêu chí chấp nhận

1. WHEN an Admin accesses `/admin/de-thi`, THE Admin_Panel SHALL display all exams with title, level, question count, thoi_gian_lam, and publish status.
2. WHEN an Admin creates an exam via POST `/api/de-thi`, THE Platform SHALL accept tieu_de, mo_ta, level, thoi_gian_lam, is_publish, and optional video_id.
3. WHEN an Admin adds a question to an exam via POST `/api/de-thi/[id]/cau-hoi`, THE Platform SHALL accept loai (MULTIPLE_CHOICE), noi_dung, optional giai_thich, thu_tu, and a dap_an array where each item contains noi_dung and la_dap_an_dung; THE Platform SHALL enforce that exactly one answer per question has la_dap_an_dung = 1.
4. WHEN an Admin deletes an exam via DELETE `/api/de-thi/[id]`, THE Platform SHALL cascade delete all associated questions, answers, exam_attempts, and attempt_answers.
5. THE Admin_Panel SHALL validate all exam and question creation input using Zod schemas before processing.

---

### Yêu cầu 11: Trang Admin — Quản lý người dùng và thống kê

**User Story:** Là một quản trị viên, tôi muốn xem danh sách người dùng, thay đổi vai trò, và xem thống kê hệ thống, để quản lý hoạt động học tập toàn nền tảng.

#### Tiêu chí chấp nhận

1. WHEN an Admin accesses `/admin/nguoi-dung`, THE Admin_Panel SHALL display a paginated list of all users with search by name/email and filter by vai_tro (STUDENT, ADMIN).
2. WHEN an Admin changes a user's role via PUT `/api/admin/nguoi-dung/[id]/vai-tro`, THE Platform SHALL update vai_tro in the users table AND update the user's publicMetadata in Clerk to keep the two sources in sync.
3. WHEN an Admin accesses `/admin/thong-ke`, THE Admin_Panel SHALL display aggregate statistics including: total registered users, total published lessons, total published exams, total completed lessons (da_hoan_thanh = 1 across all users), and total exam attempts submitted.
4. THE Admin_Panel SHALL render all admin pages using SSR with no-cache headers to display real-time data.

---

### Yêu cầu 12: Chuẩn hóa API và xử lý lỗi

**User Story:** Là một nhà phát triển tích hợp, tôi muốn mọi API endpoint trả về cấu trúc response nhất quán, để client có thể xử lý thành công và lỗi theo cùng một pattern.

#### Tiêu chí chấp nhận

1. THE Platform SHALL format every successful API response as `{ success: true, data: ... }`.
2. THE Platform SHALL format every error API response as `{ success: false, error: { code: string, message: string } }`.
3. THE Platform SHALL use the following HTTP status codes consistently: 200 for success, 401 for UNAUTHORIZED, 403 for FORBIDDEN, 404 for NOT_FOUND, 409 for CONFLICT, and 422 for VALIDATION_ERROR.
4. THE Platform SHALL validate all client-provided request bodies using Zod schemas before any database operation; IF validation fails, THEN THE Platform SHALL return a 422 VALIDATION_ERROR response.
5. THE Platform SHALL use the TypeScript `strict` mode compiler option throughout the codebase and SHALL NOT use the `any` type.
6. WHEN any API route requires authentication, THE Platform SHALL call the Clerk `auth()` function and verify the userId before executing any business logic; IF the userId is absent, THEN THE Platform SHALL return a 401 UNAUTHORIZED response.

---

### Yêu cầu 13: Cấu hình hạ tầng và môi trường

**User Story:** Là một kỹ sư DevOps, tôi muốn hệ thống được cấu hình đúng với các biến môi trường và kết nối dịch vụ bên ngoài, để ứng dụng chạy ổn định trên Vercel.

#### Tiêu chí chấp nhận

1. THE Platform SHALL use a Prisma singleton pattern in `lib/prisma.ts` to prevent connection pool exhaustion during Next.js hot-reload in development.
2. THE Platform SHALL read database credentials exclusively from the `DATABASE_URL` environment variable; the application SHALL NOT hardcode any database connection string.
3. THE Platform SHALL require the following environment variables to be present at build and runtime: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. THE Platform SHALL use Supabase Storage bucket `french-media` to store lesson cover images and flashcard audio files, accessed via the public URL pattern `https://[project-ref].supabase.co/storage/v1/object/public/french-media/...`.
5. THE Platform SHALL use the `SUPABASE_SERVICE_ROLE_KEY` exclusively on the server side for file upload operations and SHALL NOT expose it to the client.

---

### Yêu cầu 14: Giao diện và trải nghiệm người dùng

**User Story:** Là một học viên, tôi muốn giao diện nhất quán và trực quan với màu sắc và font chữ thương hiệu FrenchGo, để việc học trở nên dễ chịu và tập trung.

#### Tiêu chí chấp nhận

1. THE Platform SHALL apply the Exo font (from Google Fonts) as the sole typeface across all pages, components, forms, tables, and navigation elements.
2. THE Platform SHALL use `#CB30E0` as the primary color for headings, primary action buttons, and progress bars.
3. THE Platform SHALL display lesson completion statuses using the following color codes: `#55BE24` for completed (da_hoan_thanh = 1), `#0088FF` for in-progress (0 < phan_tram < 80), and `#5B5B5B` for not started.
4. THE Platform SHALL use `#55BE24` for the "Dễ" flashcard rating button, `#F51A1A` for the "Khó" button, and `#CB30E0` for the "Làm lại" button.
5. THE Platform SHALL use Framer Motion for transition animations on page navigation and interactive components such as flashcard flip, modal open/close, and progress bar fill.
6. THE Platform SHALL implement responsive layouts supporting mobile (≥ 375px), tablet (≥ 768px), and desktop (≥ 1280px) viewport widths.
7. THE Platform SHALL use Shadcn UI components as the base component library for forms, dialogs, tables, and navigation.
8. WHERE a component requires client-side interactivity (flashcard flip, countdown timer, mini quiz), THE Platform SHALL mark it with the `"use client"` directive; all other components SHALL be Server Components by default.
