# Đặc tả API - FrenchGo

## Chuẩn chung
Response luôn theo dạng:
  { success: true, data: ... }
  { success: false, error: { code: "...", message: "..." } }

Mã lỗi dùng:
- UNAUTHORIZED (401) - chưa đăng nhập
- FORBIDDEN (403)    - không có quyền
- NOT_FOUND (404)    - không tìm thấy
- VALIDATION_ERROR (422) - dữ liệu đầu vào sai
- CONFLICT (409)     - trùng dữ liệu (vd: slug đã tồn tại)

---

## WEBHOOK

### POST /api/webhooks/clerk
Không cần auth (verify bằng Svix signature từ Clerk).
Xử lý sự kiện:
- user.created → INSERT vào bảng users (id=cuid, clerk_id, email, ten_hien_thi)
- user.updated → UPDATE ten_hien_thi, email trong users theo clerk_id
- user.deleted → DELETE user khỏi users theo clerk_id

---

## BÀI HỌC

### GET /api/bai-hoc
Public. Lấy danh sách bài học đã xuất bản (is_publish=1).
Query: ?level=A1&chu_de=VOCABULARY&search=bonjour
Response: { data: lessons[], total: number }

### GET /api/bai-hoc/[slug]
Public. Chi tiết 1 bài học kèm toàn bộ lesson_sections sắp xếp theo thu_tu.
Response: { data: lesson & { sections: lesson_sections[] } }

### POST /api/bai-hoc
ADMIN only. Tạo bài học mới.
Body: { tieu_de, level, chu_de, anh_bia?, thoi_gian_doc?, sections: [] }
Kiểm tra: slug tự generate từ tieu_de, kiểm tra không trùng.

### PUT /api/bai-hoc/[id]
ADMIN only. Cập nhật bài học.

### DELETE /api/bai-hoc/[id]
ADMIN only. Xóa bài học (CASCADE tự xóa lesson_sections và lesson_progresses).

---

## TIẾN ĐỘ BÀI HỌC

### POST /api/tien-do
Student. Cập nhật tiến độ đọc.
Body: { lesson_id: string, phan_tram: number }
Logic: UPSERT vào lesson_progresses
       Nếu phan_tram >= 80 và da_hoan_thanh = 0 → đặt da_hoan_thanh = 1
Response: { data: { phan_tram, da_hoan_thanh } }

### GET /api/tien-do
Student. Lấy toàn bộ tiến độ của user đang đăng nhập.

---

## FLASHCARD

### GET /api/flashcard/bo-the
Public. Danh sách bộ thẻ đã xuất bản.
Query: ?level=A1&search=...

### GET /api/flashcard/bo-the/[id]
Public. Chi tiết bộ thẻ kèm danh sách flashcards.

### GET /api/flashcard/on-tap
Student. Lấy các thẻ có ngày cần ôn <= hôm nay của user.
(Dựa vào flashcard_states.so_ngay_hoi và ngày tạo/cập nhật)

### POST /api/flashcard/danh-gia
Student. Ghi nhận đánh giá và cập nhật SM-2.
Body: { flashcard_id: string, danh_gia: "AGAIN"|"HARD"|"GOOD"|"EASY" }
Logic: UPSERT flashcard_states
       Tính so_ngay_hoi mới theo công thức SM-2

### POST /api/flashcard/bo-the
ADMIN only. Tạo bộ thẻ mới.

### POST /api/flashcard/the
ADMIN only. Thêm thẻ vào bộ.
Body: { deck_id, tu_phap, nghia_viet, phat_am?, vi_du?, audio_url? }

### PUT /api/flashcard/the/[id]
ADMIN only. Sửa thẻ.

### DELETE /api/flashcard/bo-the/[id]
ADMIN only. Xóa bộ thẻ (CASCADE xóa flashcards và flashcard_states).

---

## ĐỀ THI

### GET /api/de-thi
Public. Danh sách đề thi đã xuất bản.

### GET /api/de-thi/[id]
Public. Chi tiết đề thi + câu hỏi + đáp án.
QUAN TRỌNG: KHÔNG trả la_dap_an_dung = true về cho client.
Chỉ trả noi_dung của answers, ẩn trường la_dap_an_dung.

### POST /api/de-thi
ADMIN only. Tạo đề thi mới.

### POST /api/de-thi/[id]/cau-hoi
ADMIN only. Thêm câu hỏi + đáp án.
Body: { loai, noi_dung, giai_thich?, thu_tu, dap_an: [{noi_dung, la_dap_an_dung}] }

### DELETE /api/de-thi/[id]
ADMIN only. Xóa đề (CASCADE xóa questions, answers, exam_attempts, attempt_answers).

---

## LÀM BÀI THI

### POST /api/luot-lam
Student. Bắt đầu làm bài.
Body: { exam_id: string }
Tạo bản ghi exam_attempts với da_nop = 0.
Response: { data: { attempt_id } }

### POST /api/luot-lam/[id]/nop
Student. Nộp bài và nhận kết quả.
Body: { cau_tra_loi: [{ question_id, noi_dung }] }
Logic server-side:
1. Lấy đề thi kèm answers (có la_dap_an_dung) từ DB
2. So sánh từng câu trả lời với đáp án đúng
3. Tính diem_so = (số câu đúng / tổng) * 100
4. Lưu attempt_answers (la_dung, diem_dat_duoc)
5. Cập nhật exam_attempts (diem_so, da_nop=1, thoi_gian_nop)
Response: { data: { diem_so, chi_tiet: [{question_id, la_dung, dap_an_dung}] } }

---

## NGƯỜI DÙNG

### GET /api/nguoi-dung/toi
Student. Thông tin user đang đăng nhập.

### PUT /api/nguoi-dung/toi
Student. Cập nhật tên hiển thị.
Body: { ten_hien_thi: string }

### GET /api/admin/nguoi-dung
ADMIN only. Danh sách users.
Query: ?search=&vai_tro=STUDENT

### PUT /api/admin/nguoi-dung/[id]/vai-tro
ADMIN only. Đổi vai trò user.
Body: { vai_tro: "STUDENT"|"ADMIN" }
Cập nhật cả DB lẫn Clerk publicMetadata.