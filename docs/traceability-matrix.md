# Ma trận truy vết

Yêu cầu (SRS) → Use case → Thiết kế → Mã nguồn → Kiểm thử. Đường dẫn mã tính từ `apps/`.

| Yêu cầu | Use case | Thiết kế | Mã nguồn | Kiểm thử |
| --- | --- | --- | --- | --- |
| FR-01 Menu | UC-01 | Activity-01, C4 Container | `api/src/products/*`, `web/app/page.tsx` | `products.controller.spec.ts`, `products.service.spec.ts`, `api/test/products.e2e-spec.ts` |
| FR-02 Chi tiết, size/topping | UC-02 | Class-01 (Product, Topping) | `api/src/products`, `api/src/toppings`, `web/components/ProductOptions.tsx`, `web/lib/pricing.ts` | `web/lib/pricing.test.ts`, `web/lib/options.test.ts`, `products.e2e-spec.ts` |
| FR-03 Giỏ hàng | UC-03 | Activity-01 | `web/context/CartContext.tsx`, `web/lib/cart.ts` | `web/lib/cart.test.ts`, E2E `checkout.spec.ts` |
| FR-04 Xác thực JWT | UC-04, UC-05 | ADR-002, Sequence-01 bước 3 | `api/src/auth/*` | `auth.service.spec.ts`, `auth.controller.spec.ts`, `app.e2e-spec.ts` (AC-06), E2E AC-06 |
| FR-05 Đặt đơn, tính lại giá | UC-06 | Sequence-01, BR-01 | `api/src/orders/orders.service.ts` (`priceFromCatalog`) | `orders.service.spec.ts`, `app.e2e-spec.ts` (AC-04, 400) |
| FR-06 Thanh toán Ví/Thẻ mô phỏng | UC-08 | ADR-008, Sequence-01 | `api/src/payments/*`, `web/app/mock-pay/page.tsx` | `mock-gateway.spec.ts`, `app.e2e-spec.ts` (AC-01, AC-02), E2E AC-01, AC-02 |
| FR-07 Idempotency | UC-08 E4 | ADR-004 | `payments.service.ts` (`createPayment`, `confirmMockPayment`), `payments.idempotencyKey @unique` | `payments.service.spec.ts` (4 case), `mock-gateway.spec.ts`, `app.e2e-spec.ts` (AC-03) |
| FR-08 Xác nhận, theo dõi | UC-09 | Activity-01 | `web/app/order-confirmation`, `web/app/orders/[id]` | E2E AC-01, AC-02 |
| FR-09 Lịch sử đơn | UC-10 | Class-01 | `orders.controller.ts` (`GET /orders/me`) | `orders.controller.spec.ts` |
| FR-10 Trạng thái đơn (quầy) | UC-12 | ADR-003, BR-06 | `orders/order-state.ts`, `staff-orders.controller.ts`, `web/app/staff` | `order-state.spec.ts`, `staff-orders.spec.ts` |
| FR-11 Khuyến mãi | UC-07 | Class-01 Promotion | `orders.service.ts` (`validatePromotion`) | `payments.service.spec.ts` (usage_count khi thanh toán) |
| FR-12 Điểm thưởng | UC-08 | BR-03, Class-01 LoyaltyTransaction | `payments.service.ts` (`awardLoyaltyPoints`) | `payments.service.spec.ts` |
| FR-13 Tồn kho | UC-06 E3 | ADR-005, BR-04 | `api/src/inventory/*` | `inventory.calculator.spec.ts`, `inventory.service.spec.ts` |
| FR-14 Hủy đơn, hết hạn 15 phút | UC-11 | BR-05 | `orders.service.ts` (`cancelOrder`), `order-expiry.service.ts`, `payments-scheduler.service.ts` | `orders.cancel.spec.ts`, `payments-scheduler.service.spec.ts` |
| FR-15 PWA | – | – | chưa làm (Could) | – |
| NFR-01 Hiệu năng | – | – | – | `products.e2e-spec.ts` (< 500 ms) |
| NFR-02 Bảo mật | – | ADR-002 | `main.ts` (ValidationPipe, kiểm env), bcrypt, `staff.guard.ts` | `auth.*.spec.ts`, `staff-orders.spec.ts` |
| NFR-03 Mobile-first | – | – | `apps/web` (Tailwind) | E2E Playwright Pixel 7 |
| NFR-04 Khả dụng | – | Deployment diagram | `app.controller.ts` (`/health`), Dockerfile HEALTHCHECK | `app.controller.spec.ts`, smoke test trong `cd.yml` |
| NFR-05 Toàn vẹn dữ liệu | – | ADR-003, 004, 005 | state machine, transaction, UNIQUE | `order-state.spec.ts`, `payments.service.spec.ts`, `inventory.service.spec.ts` |
| NFR-06 Triển khai | – | ADR-006, ADR-007 | `docker-compose.yml`, `.github/workflows/*`, Prisma migrations | CI, CD |
| NFR-07 Bảo trì | – | ADR-001, ADR-002 | module theo domain | CI lint |

Ghi chú khác biệt so với thiết kế Task 3: API thanh toán hiện thực là `POST /api/payment/create/:code` + `POST /api/payment/mock/confirm` (thay cho `POST /payments`), khuyến mãi là `POST /orders/validate-promotion`. Sequence-01 và architecture-overview đã cập nhật theo.
