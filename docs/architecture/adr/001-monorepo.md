# ADR-001: Monorepo `apps/web`, `apps/api`, `docs`

- **Trạng thái:** Chấp nhận – 15/11/2026
- **Bối cảnh:** Đề yêu cầu cấu trúc `apps/web`, `apps/api`, `docs`, `tests`, `.github/workflows`; nhóm 6 người cần thấy cùng lúc tài liệu, code và pipeline; mọi thay đổi yêu cầu/sơ đồ phải đi qua PR.
- **Quyết định:** Một repository GitHub duy nhất (monorepo) chứa frontend, backend, tài liệu, test tích hợp/E2E và workflow. Mỗi app có `package.json` riêng (npm), không dùng công cụ monorepo (Nx/Turborepo).
- **Hệ quả:** (+) Một PR có thể đổi đồng thời API, UI, sơ đồ và ma trận truy vết; truy vết dễ. (+) CI dùng `paths` filter để chỉ chạy job cần thiết. (−) Lịch sử commit chung, cần quy ước commit theo scope (`feat(api)`, `docs(diagrams)`). (−) Không chia sẻ code TypeScript giữa web/api; kiểu dữ liệu API được khai báo lại ở web.
