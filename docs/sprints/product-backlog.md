# Product Backlog – Assignment 2

Product Owner: Trương Thanh Tòng · Scrum Master: Nhữ Đình Hùng. Ưu tiên theo MoSCoW trong `docs/requirements/srs.md`; tiêu chí chấp nhận xem cột "Tiêu chí chấp nhận" của SRS.

## Sprint 1 – Nền tảng và luồng xem menu (Task 4)

Sprint Goal: repository có cấu trúc chuẩn, tài liệu Task 1–3 có kiểm soát phiên bản, CI chạy khi mở PR và MVP xem menu chạy được.

| # | Hạng mục | Yêu cầu | Ưu tiên | Trạng thái | PR |
| --- | --- | --- | --- | --- | --- |
| S1-01 | Đưa tài liệu yêu cầu (Task 1) vào `docs/requirements` | – | M | Xong | #1 |
| S1-02 | Đưa sơ đồ activity, sequence, class (Task 2) vào `docs/diagrams` | – | M | Xong | #2 |
| S1-03 | Đưa kiến trúc C4, ADR, deployment diagram (Task 3) vào `docs/architecture` | – | M | Xong | #3 |
| S1-04 | Cấu trúc `apps/web`, `apps/api`, README, `.gitignore`, `.env.example` | NFR-06 | M | Xong | #4 |
| S1-05 | API `GET /products`, `GET /products/:id` + seed dữ liệu mẫu | FR-01 | M | Xong | #4 |
| S1-06 | Màn hình menu mobile-first, trạng thái loading/empty/error | FR-01, NFR-03 | M | Xong | #4 |
| S1-07 | Unit test API và web tối thiểu | FR-01 | M | Xong | #4 |
| S1-08 | CI: Install → Lint → Test → Build khi mở PR | NFR-06, NFR-07 | M | Xong | #4 |

## Sprint 2 – Luồng đặt và thanh toán, CI/CD và bàn giao (Task 5)

Sprint Goal: hoàn thành luồng menu → giỏ → đặt đơn → thanh toán → xác nhận, tự động đóng gói và triển khai production.

| # | Hạng mục | Yêu cầu | Ưu tiên | Trạng thái | PR |
| --- | --- | --- | --- | --- | --- |
| S2-01 | Chi tiết sản phẩm, size, topping, giá cập nhật | FR-02 | M | Xong | #4 |
| S2-02 | Giỏ hàng, tổng tiền | FR-03 | M | Xong | #4 |
| S2-03 | Đăng ký, đăng nhập JWT | FR-04 | M | Xong | #4 |
| S2-04 | Tạo đơn, backend tự tính lại giá từ CSDL | FR-05 | M | Xong | #5 |
| S2-05 | Thanh toán Ví/Thẻ mô phỏng, idempotent | FR-06, FR-07 | M | Xong | #5 |
| S2-06 | Xác nhận, trạng thái, lịch sử đơn | FR-08, FR-09 | M | Xong | #4 |
| S2-07 | Màn hình quầy, state machine trạng thái đơn | FR-10 | M | Xong | #4 |
| S2-08 | Khuyến mãi, điểm thưởng | FR-11, FR-12 | S | Xong | #4 |
| S2-09 | Giữ chỗ nguyên liệu, hủy đơn, tự hủy sau 15 phút | FR-13, FR-14 | S | Xong | #4 |
| S2-10 | `GET /health` kiểm tra DB | NFR-04 | M | Xong | #5 |
| S2-11 | Integration test PostgreSQL, E2E Playwright | NFR-05 | M | Xong | #5 |
| S2-12 | `docker-compose.yml` chạy web, API, DB | NFR-06 | M | Xong | #5 |
| S2-13 | CD: image tag SHA → GHCR → máy server (Tailscale Funnel) → smoke test → rollback | NFR-04, NFR-06 | M | Xong (pipeline), chờ bật deploy | #5 |
| S2-14 | Sửa header bị cắt trên điện thoại | NFR-03 | M | Xong | commit trên `main` |
| S2-15 | Release v1.0.0, release notes, Sprint Review, Retrospective | – | M | Xong (tài liệu), chờ gắn tag | – |
| S2-16 | URL production + video demo | NFR-04 | M | Chưa làm | – |

## Để lại cho sau (Could/Won't)

| Hạng mục | Yêu cầu | Lý do |
| --- | --- | --- |
| PWA manifest và icon | FR-15 | Could, ưu tiên thấp hơn luồng thanh toán |
| Thông báo đẩy khi đồ uống sẵn sàng | FR-16 | Won't trong Assignment 2 |
| Cổng thanh toán thật (VNPay/MoMo) | – | Ngoài phạm vi, dùng cổng mô phỏng (ADR-008) |
