# Retrospective – Assignment 2

Nhóm 14 · Scrum Master: Nhữ Đình Hùng · Product Owner: Trương Thanh Tòng

## Điều làm tốt

- Làm Task 1–3 (yêu cầu, mô hình, kiến trúc) trước khi viết code nên khi chuyển code A1 sang `apps/` đã có sẵn tiêu chí chấp nhận AC-01..AC-07 để viết test.
- Tái sử dụng được phần lớn code A1 (state machine, idempotency, tồn kho), chỉ cần bổ sung thanh toán mô phỏng, `/health` và kiểm thử.
- Integration test trên PostgreSQL thật phát hiện lỗi backend tin giá client gửi lên, điều mà unit test dùng mock không bắt được.

## Điều chưa tốt

- Đường dẫn API thanh toán và khuyến mãi khi hiện thực khác thiết kế Task 3; phải quay lại sửa Sequence-01 và architecture-overview.
- Test e2e của A1 dùng email cố định nên không chạy lặp lại được trên cùng DB.
- Quyền GitHub và tài khoản Render/Vercel được chuẩn bị muộn, làm chậm phần deploy.

## Hành động cho lần sau

| Hành động | Người phụ trách | Khi nào |
| --- | --- | --- |
| Mỗi PR đổi API phải cập nhật sơ đồ/tài liệu liên quan trong cùng PR | Cả nhóm | Từ sprint sau |
| Test tích hợp sinh dữ liệu duy nhất mỗi lần chạy | Dev | Từ sprint sau |
| Chuẩn bị quyền repo, secret và tài khoản deploy ngay đầu sprint | Scrum Master | Sprint planning |
