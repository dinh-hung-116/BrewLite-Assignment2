# ADR-006: Triển khai trên máy server của nhóm, công khai qua Tailscale Funnel + GHCR

- **Trạng thái:** Chấp nhận – 15/11/2026 (thay phương án Vercel + Render đề xuất ở Task 3)
- **Bối cảnh:** Cần URL production HTTPS, ngân sách 0 đồng, DB không public, image có tag commit SHA, deploy tự động bằng secret của CI và rollback được. Nhóm đã dùng Tailscale và có sẵn một máy chạy Docker.
- **Quyết định:**
  - CI build image `brewlite-api` và `brewlite-web` gắn tag `<commit-sha>`, đẩy lên GitHub Container Registry (GHCR).
  - Máy server cài GitHub Actions **self-hosted runner** (nhãn `brewlite-prod`); job `deploy` chạy `docker compose -f docker-compose.prod.yml` với `IMAGE_TAG=<commit-sha>`. Secret (`JWT_SECRET`, `POSTGRES_PASSWORD`) lấy từ GitHub Secrets, không lưu trên đĩa trong repo.
  - **Tailscale Funnel** công khai web (`https://datacenter.tailbd1760.ts.net:8443` → port 3000) và API (`:10000` → port 3001) qua HTTPS, chứng chỉ do Tailscale cấp. Web/API chỉ bind `127.0.0.1`; PostgreSQL chạy trong mạng Docker, không mở cổng.
  - API tự chạy `prisma migrate deploy` khi khởi động (ADR-007). Smoke test chạy từ runner của GitHub qua URL Funnel công khai; lỗi thì chạy lại image tag `stable`.
- **Phương án đã cân nhắc:** Vercel + Render (đề xuất ban đầu: phải tạo thêm tài khoản, Render miễn phí ngủ sau 15 phút, rollback ở 2 nơi), Railway (giới hạn credit), Fly.io (cần thẻ), VPS (tốn phí).
- **Hệ quả:**
  - (+) Miễn phí, HTTPS sẵn, một nền tảng duy nhất; web và API cùng image theo SHA nên rollback một lệnh; không cold start.
  - (−) Máy server phải bật và có mạng khi chấm; mất điện hoặc tắt máy là mất URL.
  - (−) Self-hosted runner trên repo public có thể bị PR từ fork lợi dụng: bật *Require approval for all outside collaborators* cho Actions và chỉ dùng runner trong `cd.yml` (chạy khi push `main`/tag, không chạy cho pull request).
  - (−) Funnel chỉ cho port 443, 8443, 10000; port 443 của máy đã dùng cho dịch vụ khác nên BrewLite dùng 8443 (web) và 10000 (API).
