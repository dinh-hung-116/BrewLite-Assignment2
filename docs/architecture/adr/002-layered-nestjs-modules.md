# ADR-002: Backend NestJS phân lớp, chia module theo domain

- **Trạng thái:** Chấp nhận – 15/11/2026
- **Bối cảnh:** Nghiệp vụ gồm sản phẩm, xác thực, đơn hàng, thanh toán, tồn kho, khuyến mãi; mỗi phần do người khác nhau làm.
- **Quyết định:** Mỗi domain là một NestJS module (`auth`, `products`, `orders`, `payments`, `inventory`, `promotions`, `health`). Trong module chia 3 lớp: **Controller** (HTTP, DTO + class-validator, guard) → **Service** (nghiệp vụ, transaction) → **Repository** (Prisma Client qua `PrismaService`). Controller không gọi Prisma trực tiếp.
- **Hệ quả:** (+) Test service bằng cách giả lập Prisma; module độc lập, ít xung đột merge. (−) Thêm lớp trung gian cho chức năng đơn giản. Trade-off: chưa tách microservice vì quy mô nhỏ và một DB.
