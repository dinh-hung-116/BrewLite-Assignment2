# ADR-006: Triển khai Vercel (web) + Render (API, PostgreSQL) + GHCR

- **Trạng thái:** Đề xuất – 15/11/2026 (chốt khi tạo tài khoản ở Sprint 2)
- **Bối cảnh:** Cần URL production HTTPS, ngân sách 0 đồng, DB không public, image có tag commit SHA, rollback được.
- **Quyết định:** `apps/web` deploy lên Vercel (CDN, HTTPS tự động). `apps/api` build Docker image, đẩy lên GitHub Container Registry với tag `<commit-sha>`, Render Web Service kéo image qua Deploy Hook. PostgreSQL dùng Render PostgreSQL, API kết nối bằng internal URL.
- **Phương án đã cân nhắc:** Railway (giới hạn credit), Fly.io (cần thẻ), VPS (tự quản HTTPS, tốn phí).
- **Hệ quả:** (+) Miễn phí, HTTPS sẵn, rollback bằng image SHA cũ và `vercel rollback`. (−) Gói miễn phí Render ngủ sau 15 phút → cold start ~1 phút, phải gọi `/health` trước demo; DB miễn phí có hạn dùng, cần backup seed. (−) Rollback phải làm ở 2 nền tảng.
