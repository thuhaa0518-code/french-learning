-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ten_hien_thi" TEXT NOT NULL,
    "vai_tro" TEXT NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "youtube_id" TEXT NOT NULL,
    "mo_ta" TEXT,
    "level" TEXT,
    "is_publish" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "chu_de" TEXT NOT NULL,
    "anh_bia" TEXT,
    "thoi_gian_doc" INTEGER NOT NULL DEFAULT 5,
    "is_publish" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_sections" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "thu_tu" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lesson_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "phan_tram" INTEGER NOT NULL DEFAULT 0,
    "da_hoan_thanh" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lesson_progresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_decks" (
    "id" TEXT NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "mo_ta" TEXT,
    "level" TEXT,
    "is_publish" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "tu_phap" TEXT NOT NULL,
    "nghia_viet" TEXT NOT NULL,
    "phat_am" TEXT,
    "vi_du" TEXT,
    "audio_url" TEXT,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_states" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "flashcard_id" TEXT NOT NULL,
    "so_ngay_nhac_lai" INTEGER NOT NULL DEFAULT 1,
    "danh_gia_cuoi" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "mo_ta" TEXT,
    "level" TEXT NOT NULL,
    "thoi_gian_lam" INTEGER NOT NULL DEFAULT 45,
    "is_publish" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "video_id" TEXT,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "loai" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "noi_dung" TEXT NOT NULL,
    "giai_thich" TEXT,
    "thu_tu" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "la_dap_an_dung" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "diem_so" DOUBLE PRECISION,
    "da_do" BOOLEAN NOT NULL DEFAULT false,
    "thoi_gian_lam" INTEGER NOT NULL DEFAULT 0,
    "da_nop" BOOLEAN NOT NULL DEFAULT false,
    "thoi_gian_nop" TIMESTAMP(3),

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "cau_tra_loi" TEXT,
    "la_dung" BOOLEAN NOT NULL DEFAULT false,
    "diem_dat_duoc" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_lessons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progresses_user_id_lesson_id_key" ON "lesson_progresses"("user_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_states_user_id_flashcard_id_key" ON "flashcard_states"("user_id", "flashcard_id");

-- CreateIndex
CREATE UNIQUE INDEX "attempt_answers_attempt_id_question_id_key" ON "attempt_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_lessons_user_id_lesson_id_key" ON "saved_lessons"("user_id", "lesson_id");

-- AddForeignKey
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progresses" ADD CONSTRAINT "lesson_progresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progresses" ADD CONSTRAINT "lesson_progresses_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "flashcard_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_states" ADD CONSTRAINT "flashcard_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_states" ADD CONSTRAINT "flashcard_states_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_lessons" ADD CONSTRAINT "saved_lessons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_lessons" ADD CONSTRAINT "saved_lessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

