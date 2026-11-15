# Sprint Review – Assignment 2

Nhóm 14 · Product Owner: Trương Thanh Tòng · Scrum Master: Nhữ Đình Hùng. Backlog chi tiết: [product-backlog.md](product-backlog.md).

## Sprint 1 (Task 4)

**Sprint Goal:** tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và MVP đầu tiên cho luồng xem menu. **Kết quả: đạt.**

Increment đã demo:
- Repository `apps/web`, `apps/api`, `docs`; tài liệu Task 1–3 vào `docs/` qua PR #1, #2, #3.
- `GET /products`, `GET /products/:id` với dữ liệu seed; trang menu mobile-first có loading, empty, error.
- CI chạy khi mở PR: Install → Lint → Unit test → Build cho `api` và `web`, kèm integration test trên PostgreSQL.

Phản hồi và điều chỉnh backlog:
- Lần CI đầu của PR #4 đỏ ở integration test: test A1 dùng email cố định và phát hiện backend tin đơn giá client gửi lên. Đưa việc sửa vào Sprint 2 (S2-04) và viết lại test để chạy lặp được.
- Cần chặn merge khi CI đỏ bằng ruleset trên `main` (hướng dẫn trong `docs/deployment.md` mục 1.6).

## Sprint 2 (Task 5)

**Sprint Goal:** hoàn thành luồng đặt và thanh toán end-to-end, tự động đóng gói và triển khai production. **Kết quả: đạt phần sản phẩm và pipeline; phần URL production và video còn chờ.**

Increment đã demo (chạy bằng `docker compose` ở local):
- Menu → chi tiết (size, topping) → giỏ → đăng nhập → đặt đơn → thanh toán Ví thành công → màn hình xác nhận PAID.
- Thẻ đuôi `0002` → PAYMENT_FAILED, giữ giỏ, thanh toán lại thành công.
- Gửi lại cùng `Idempotency-Key` không tạo thêm giao dịch; client gửi giá 1đ thì tổng vẫn tính theo CSDL.
- Màn hình quầy `/staff` chuyển PAID → PREPARING → READY → COMPLETED.
- `GET /health` trả trạng thái DB và commit SHA.

Kết quả kiểm thử: 133 unit test API, 21 unit test web, 12 integration test (PostgreSQL), 3 E2E Playwright (Pixel 7), CI trên `main` xanh.

Đối chiếu tiêu chí chấp nhận (`docs/requirements/use-case-checkout.md`):

| AC | Nội dung | Kiểm chứng | Kết quả |
| --- | --- | --- | --- |
| AC-01 | Thanh toán Ví thành công → PAID | Integration + E2E | Đạt |
| AC-02 | Thẻ lỗi → PAYMENT_FAILED, thanh toán lại được | Integration + E2E | Đạt |
| AC-03 | Cùng Idempotency-Key → một payment | Integration | Đạt |
| AC-04 | Giá tính theo CSDL, không theo client | Integration | Đạt |
| AC-05 | Hai khách đặt cùng lúc khi kho chỉ đủ 1 ly → một bên 409 | Unit (`inventory.service.spec.ts`) | Đạt |
| AC-06 | Không có JWT → 401, chuyển trang đăng nhập | Integration + E2E | Đạt |
| AC-07 | WELCOME10 trên đơn 40.000đ → 400 | Unit (`promotion.spec.ts`) | Đạt |

Chưa hoàn thành và chuyển tiếp:
- Bật deploy production trên máy server qua Tailscale Funnel, lấy URL HTTPS, gắn tag `v1.0.0` và quay video demo.
- FR-15 PWA để lại cho sau.
