# ADR-007: Prisma ORM và migration có kiểm soát phiên bản

- **Trạng thái:** Chấp nhận – 15/11/2026
- **Bối cảnh:** Cần tái tạo DB giống nhau ở local, CI và production (NFR-06); A1 đã dùng Prisma.
- **Quyết định:** Schema ở `apps/api/prisma/schema.prisma`, migration commit trong `prisma/migrations/`, seed bằng `prisma/seed.ts`. Production chỉ chạy `prisma migrate deploy` (không `migrate dev`/`reset`) khi container khởi động. Migration viết theo kiểu tương thích ngược (thêm cột trước, xóa sau) để image cũ vẫn chạy khi rollback.
- **Hệ quả:** (+) Lịch sử schema nằm trong Git, review qua PR. (−) Một số câu SQL đặc thù (UPDATE có điều kiện version) viết bằng `$executeRaw`.
