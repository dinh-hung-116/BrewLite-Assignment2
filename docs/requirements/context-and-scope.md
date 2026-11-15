# Bối cảnh, stakeholder và phạm vi (Task 1.1)

## 1. Vấn đề nghiệp vụ

Vào giờ cao điểm, một quầy đồ uống nhỏ bị nghẽn ở ba chỗ:

1. **Gọi món**: khách xếp hàng đọc menu, hỏi size và topping, nhân viên ghi tay nên dễ sai.
2. **Thanh toán**: thối tiền mặt chậm, dễ nhầm, cuối ca khó đối soát.
3. **Nhận đồ uống**: khách không biết ly của mình đã pha tới đâu nên đứng chờ quanh quầy.

BrewLite là ứng dụng web mobile-first để khách tự xem menu, chọn size/topping, đặt đơn, thanh toán không tiền mặt (Ví/Thẻ mô phỏng) và theo dõi trạng thái đơn; nhân viên quầy chỉ nhận những đơn đã thanh toán và cập nhật tiến độ pha chế.

**Luồng nghiệp vụ tối thiểu:** Xem menu → Chọn tùy chọn → Giỏ hàng → Đặt đơn → Thanh toán → Theo dõi đơn.

## 2. Stakeholder

| Stakeholder | Mục tiêu và kỳ vọng | Mức ảnh hưởng | Vai trò trong dự án |
|---|---|---|---|
| Khách hàng | Đặt nhanh trên điện thoại, giá rõ ràng theo size/topping, trả không tiền mặt, biết khi nào lấy nước | Cao | Người dùng chính; cung cấp phản hồi khi demo |
| Nhân viên quầy (barista) | Chỉ thấy đơn đã thanh toán, đọc rõ món/size/topping, cập nhật trạng thái bằng một chạm | Cao | Người dùng màn hình quầy `/staff` |
| Quản lý cửa hàng | Không thất thoát tiền và nguyên liệu, có khuyến mãi và điểm thưởng giữ chân khách | Trung bình | Product Owner đại diện; nghiệm thu nghiệp vụ |
| Giảng viên / khách hàng nghiệm thu | Có tạo phẩm đúng thứ tự Task 1→5, truy vết được, có URL production | Cao | Chấm điểm, nghiệm thu bàn giao |
| Nhóm phát triển (Nhóm 14) | Yêu cầu rõ để viết test, kiến trúc dễ chia việc, deploy tự động | Cao | Phân tích, thiết kế, lập trình, kiểm thử, vận hành |
| Đơn vị thanh toán | Nhận yêu cầu trừ tiền hợp lệ, không bị gọi trùng | Thấp | Mô phỏng bằng Mock Payment Service trong phạm vi môn học |

## 3. Phạm vi

### 3.1 Trong phạm vi MVP (Must)

- Menu đồ uống, chi tiết món, chọn size S/M/L và topping, giá tự tính.
- Giỏ hàng lưu trên trình duyệt; đăng ký, đăng nhập bằng JWT.
- Đặt đơn từ giỏ hàng (backend tự tính lại giá), thanh toán Ví/Thẻ **mô phỏng**, idempotent.
- Màn hình xác nhận, theo dõi trạng thái đơn, lịch sử đơn.
- Quản lý trạng thái đơn theo state machine; màn hình quầy cho nhân viên.
- Docker Compose cho local, CI/CD, triển khai production có HTTPS và `GET /health`.

### 3.2 Phạm vi mở rộng (Should/Could)

- Mã khuyến mãi, điểm thưởng (loyalty).
- Giữ chỗ nguyên liệu theo công thức để không bán quá tồn kho.
- Khách tự hủy đơn chưa pha; tự hủy đơn quá hạn thanh toán 15 phút.
- Cài đặt như ứng dụng (PWA manifest).

### 3.3 Ngoài phạm vi (Won't)

- Kết nối cổng thanh toán thật (VNPay/MoMo/Stripe) và hoàn tiền thật.
- Giao hàng tận nơi, đặt bàn, nhiều chi nhánh.
- Trang quản trị CRUD menu/kho có giao diện riêng (dữ liệu nạp bằng seed/migration).
- Thông báo đẩy, email, SMS; ứng dụng di động native.

## 4. Giả định

- Khách dùng điện thoại có trình duyệt hiện đại và Internet.
- Mỗi cửa hàng có một quầy; nhân viên dùng tài khoản role `STAFF` tạo sẵn bằng seed.
- Giá và công thức đồ uống thay đổi ít, cập nhật bằng seed/migration.
- Cổng thanh toán mô phỏng trả kết quả ngay (đồng bộ); quy tắc lỗi cố định để demo được nhánh thất bại.
- Khách nhận đồ uống tại quầy, không cần giao hàng.

## 5. Ràng buộc

- Công nghệ bắt buộc: Next.js (frontend mobile-first/PWA), NestJS (backend), PostgreSQL; đóng gói bằng Docker.
- Năm task làm tuần tự; tạo phẩm phải nằm trên repository với lịch sử commit/PR rõ ràng.
- Cấu trúc repo: `apps/web`, `apps/api`, `docs`, `tests`, `.github/workflows`.
- Ngân sách 0 đồng: dùng gói miễn phí của nền tảng triển khai.
- Thời gian: hoàn thành trước buổi trình bày (dự kiến 25/11/2026); nhóm 6 sinh viên làm song song việc học khác.
- Secret không được commit vào repository hoặc in ra log CI.

## 6. Rủi ro ban đầu

| Rủi ro | Khả năng | Ảnh hưởng | Cách giảm thiểu |
|---|---|---|---|
| Khách bấm thanh toán nhiều lần hoặc mất mạng rồi gửi lại | Cao | Rất cao (trừ tiền 2 lần) | Idempotency-Key, ràng buộc UNIQUE ở bảng `payments` (ADR-004) |
| Nhiều khách đặt cùng lúc khi nguyên liệu sắp hết | Trung bình | Cao (bán quá kho) | Giữ chỗ nguyên liệu trong transaction + optimistic locking (ADR-005) |
| Đơn nhảy trạng thái sai, hai nhân viên bấm cùng lúc | Trung bình | Cao | State machine tập trung + UPDATE có điều kiện trạng thái cũ (ADR-003) |
| Nền tảng miễn phí ngủ khi không có truy cập (cold start) | Cao | Trung bình | Health check, smoke test sau deploy, mở trước buổi demo (ADR-006) |
| Lộ secret (JWT, DB URL) lên GitHub | Trung bình | Cao | `.env.example` không chứa giá trị thật; secret trong GitHub Secrets/nền tảng |
| Code A1 khác cấu trúc A2 | Cao | Trung bình | Chuyển dần sang `apps/` qua từng PR Sprint 1, Sprint 2 |
| Thành viên trễ việc, merge xung đột | Trung bình | Trung bình | PR nhỏ, review chéo, CI chặn merge khi lỗi |
