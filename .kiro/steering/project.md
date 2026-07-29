# Dự án: Website học tiếng Pháp trực tuyến - FrenchGo

## Tổng quan
Nền tảng học tiếng Pháp trực tuyến cho học sinh và sinh viên Việt Nam.
Hỗ trợ cấp độ A1, A2, B1, B2 theo khung CEFR.

## Tech Stack
- Framework: Next.js 15 (App Router) — KHÔNG dùng Pages Router
- Ngôn ngữ: TypeScript strict mode
- CSS: Tailwind CSS + Shadcn UI
- Animation: Framer Motion
- Database ORM: Prisma
- Database: PostgreSQL (host trên Supabase)
- Xác thực: Clerk
- Lưu file: Supabase Storage
- Deploy: Vercel

## Phân quyền người dùng
- vai_tro = "STUDENT" → học viên, truy cập: /, /bai-hoc, /flashcard, /de-thi, /dashboard
- vai_tro = "ADMIN"   → giáo viên, truy cập thêm: /admin và tất cả API /api/admin/*
- Middleware chạy tại Vercel Edge kiểm tra vai trò trước khi vào trang

## Quy tắc code bắt buộc
- Mọi API route kiểm tra auth bằng Clerk trước khi xử lý
- Tên bảng DB: snake_case tiếng Việt (vd: lesson_progresses, flashcard_states)
- Tên biến TypeScript: camelCase
- Response API luôn theo dạng:
  { success: true, data: ... }
  hoặc
  { success: false, error: { code: string, message: string } }
- Không dùng "any" trong TypeScript
- Dùng Zod để validate mọi input từ client
- Ưu tiên Server Component, chỉ thêm "use client" khi thực sự cần

## Cấu trúc thư mục
app/
  (public)/
    page.tsx              ← Trang chủ
    bai-hoc/
      page.tsx            ← Danh sách bài học
      [slug]/page.tsx     ← Chi tiết bài học
    de-thi/
      page.tsx            ← Danh sách đề thi
      [id]/page.tsx       ← Trang làm bài
  (student)/              ← Cần đăng nhập
    dashboard/page.tsx
    flashcard/page.tsx
    ket-qua/[id]/page.tsx
  admin/                  ← Chỉ ADMIN
    bai-hoc/page.tsx
    flashcard/page.tsx
    de-thi/page.tsx
    nguoi-dung/page.tsx
    thong-ke/page.tsx
  api/
    webhooks/clerk/route.ts
    bai-hoc/route.ts
    bai-hoc/[id]/route.ts
    tien-do/route.ts
    flashcard/
    de-thi/
    luot-lam/
    admin/
lib/
  prisma.ts               ← Prisma singleton (quan trọng)
  auth.ts                 ← Helper lấy user từ Clerk
components/
  ui/                     ← Shadcn components
  lesson/
  flashcard/
  exam/
  dashboard/