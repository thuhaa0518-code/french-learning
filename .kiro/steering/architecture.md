# Kiến trúc hệ thống - FrenchGo

## Chiến lược Rendering
- Trang chủ, danh sách bài học, chi tiết bài học → ISR (revalidate: 300 giây)
  Sau khi admin xuất bản nội dung mới: gọi revalidatePath('/bai-hoc')
- Dashboard, tiến độ cá nhân, kết quả thi → SSR (no-cache, dữ liệu riêng tư)
- Trang Admin → SSR (luôn fresh)
- Flashcard flip, timer đếm ngược, quiz tương tác → Client Component ("use client")

## Luồng xác thực (Auth Flow)
Bước 1: Người dùng đăng ký/đăng nhập qua Clerk tại /sign-in hoặc /sign-up
Bước 2: Clerk phát JWT session cookie
Bước 3: Khi đăng ký mới → Clerk gửi webhook user.created
        → /api/webhooks/clerk nhận → tạo bản ghi trong bảng users
Bước 4: Middleware tại Edge đọc JWT → kiểm tra vai_tro → cho phép hoặc chặn
Bước 5: Trong Server Component dùng: auth() từ @clerk/nextjs/server
Bước 6: Trong API route: auth() → lấy userId → tìm user trong DB bằng clerk_id

## Middleware (file: middleware.ts)
Chạy tại Vercel Edge Runtime (nhanh, không qua server).
- Route Admin (/admin/*, /api/admin/*):
  Kiểm tra vai_tro = "ADMIN", nếu không → redirect về /
- Route Student (/dashboard/*, /api/tien-do/*, ...):
  Kiểm tra đã đăng nhập, nếu không → redirect về /sign-in
- Route Public (/, /bai-hoc/*, /sign-in, /sign-up):
  Ai cũng vào được

## Prisma Singleton (QUAN TRỌNG)
File: lib/prisma.ts
Lý do: Next.js dev mode tải lại code liên tục, nếu không dùng singleton
sẽ tạo quá nhiều kết nối DB và bị lỗi.

Code:
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

## Biến môi trường cần có (.env.local)
DATABASE_URL=                    ← URL kết nối PostgreSQL từ Supabase
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  ← từ Clerk Dashboard
CLERK_SECRET_KEY=                ← từ Clerk Dashboard
CLERK_WEBHOOK_SECRET=            ← từ Clerk Dashboard (Webhooks)
NEXT_PUBLIC_SUPABASE_URL=        ← từ Supabase Dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=   ← từ Supabase Dashboard
SUPABASE_SERVICE_ROLE_KEY=       ← từ Supabase Dashboard (dùng để upload)

## Supabase Storage
Dùng để lưu: ảnh bìa bài học, file audio phát âm flashcard
Tên bucket: french-media (hoặc tên bạn đặt khi tạo trong Supabase)
Public URL: https://[project-ref].supabase.co/storage/v1/object/public/french-media/...



## Màu sắc chính (từ Figma)
- Primary (màu chữ tiêu đề, nút chính): #CB30E0 (tím hồng đậm)
- Text thường: #000000
- Background: #ffffff
- Card border: #5B5B5B
- Trạng thái "Đã Hoàn Thành": màu xanh lá #55BE24
- Trạng thái "Đang Học": màu xanh dương #0088FF
- Trạng thái "Chưa Bắt Đầu": màu xám #5B5B5B
- Nút flashcard "Dễ": xanh lá #55BE24
- Nút flashcard "Khó": đỏ #F51A1A
- Nút flashcard "Làm lại": tím hồng #CB30E0
- Progress bar: màu tím hồng #CB30E0

## Font chữ

Sử dụng duy nhất font **Exo** cho toàn bộ hệ thống (tiêu đề, nội dung, button, navbar, form, bảng dữ liệu...) nhằm đảm bảo giao diện hiện đại, thống nhất và dễ đọc.

### Google Font
- Font chính: Exo — Google Fonts

### Cách khai báo trong app/layout.tsx

```tsx
import { Exo } from "next/font/google";

const exo = Exo({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-exo',
});
```

### Thêm vào thẻ body

```tsx
<body className={`${exo.variable} font-exo`}>
```

### Cấu hình Tailwind

```ts
fontFamily: {
  exo: ['var(--font-exo)'],
}
```

### Cách sử dụng

Đặt Exo làm font mặc định cho toàn bộ ứng dụng:

```tsx
className="font-exo"
```

Hoặc cấu hình trong Tailwind để toàn bộ website tự động sử dụng Exo mà không cần thêm `font-exo` cho từng component.