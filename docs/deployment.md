# Triển khai production

Nền tảng theo [ADR-006](architecture/adr/006-deploy-tailscale-funnel-ghcr.md): **máy server của nhóm** chạy Docker Compose (`docker-compose.prod.yml`), công khai qua **Tailscale Funnel**; image lưu ở **GHCR**; **GitHub Actions** chạy CI/CD (job deploy chạy trên self-hosted runner đặt trên máy server).

| Thành phần | URL production |
| --- | --- |
| Web | https://datacenter.tailbd1760.ts.net:8443 |
| API | https://datacenter.tailbd1760.ts.net:10000 |
| Health check | https://datacenter.tailbd1760.ts.net:10000/health |

Funnel chỉ cho cổng 443, 8443, 10000; cổng 443 của máy server đã dùng cho dịch vụ khác nên web dùng 8443, API dùng 10000.

## 1. Thiết lập một lần trên máy server

Máy server cần Docker (Docker Desktop trên Windows/macOS hoặc Docker Engine trên Linux) và Git.

1. **Tailscale:** cài Tailscale, đăng nhập tailnet của nhóm. Trong trang quản trị Tailscale bật *HTTPS Certificates* (DNS) và cho phép Funnel cho máy này (Access controls → `nodeAttrs` có `"attr": ["funnel"]`).
2. **Bật Funnel** (chạy một lần, tự giữ sau khi khởi động lại):
   ```bash
   tailscale funnel --bg --https=8443 3000    # web  -> https://datacenter.tailbd1760.ts.net:8443
   tailscale funnel --bg --https=10000 3001   # API  -> https://datacenter.tailbd1760.ts.net:10000
   tailscale funnel status                   # xem URL
   ```
3. **Self-hosted runner:** GitHub → repo → Settings → Actions → Runners → *New self-hosted runner*, làm theo lệnh GitHub hiển thị cho đúng hệ điều hành; khi `config` thêm nhãn `brewlite-prod`, rồi cài chạy như service (`svc install` trên Linux/macOS, chọn "run as service" trên Windows).
4. **An toàn cho repo public:** Settings → Actions → General → *Fork pull request workflows from outside collaborators* = **Require approval for all outside collaborators**. Runner chỉ được dùng trong `cd.yml` (chạy khi push `main`/tag), CI của pull request vẫn chạy trên runner của GitHub.
5. **GitHub → Settings → Secrets and variables → Actions:**
   - Secrets: `JWT_SECRET` (chuỗi ngẫu nhiên dài), `POSTGRES_PASSWORD`
   - Variables: `WEB_URL=https://datacenter.tailbd1760.ts.net:8443`, `API_URL=https://datacenter.tailbd1760.ts.net:10000`, `DEPLOY_ENABLED=true`
6. **Chặn merge khi CI lỗi:** Settings → Rules → Rulesets → nhánh `main`: Require a pull request, Require status checks (`api - install, lint, test, build`, `web - install, lint, test, build`, `api - integration test (PostgreSQL)`, `web - E2E Playwright (Pixel 7)`).
7. Chạy lại workflow **CD** (Actions → CD → *Run workflow*) hoặc merge một PR vào `main` để deploy lần đầu. Seed menu mẫu chạy tự động (`SEED_ON_START=true`, chạy lặp lại an toàn).

## 2. Luồng mỗi lần merge vào main

`build-push` (runner GitHub: image `brewlite-api` và `brewlite-web` tag commit SHA, web nhúng `API_URL`) → `deploy` (runner `brewlite-prod`: `docker compose -f docker-compose.prod.yml pull` + `up -d --wait`, API chạy `prisma migrate deploy` khi khởi động) → `smoke-test` (runner GitHub, qua URL Funnel công khai: `/health` ok + đúng SHA, `/products` có dữ liệu, trang web 200) → `mark-stable` (gắn tag `stable` cho cả hai image).
Nếu `deploy` hoặc `smoke-test` lỗi, job `rollback` chạy lại `docker compose` với `IMAGE_TAG=stable`.

## 3. Secret và log

- Repo chỉ có `.env.example` và `apps/api/.env.example` không chứa giá trị thật; `.env` nằm trong `.gitignore`. Secret production chỉ nằm trong GitHub Secrets và được truyền vào job deploy qua biến môi trường.
- API dừng ngay nếu production thiếu `DATABASE_URL` hoặc `JWT_SECRET`; compose báo lỗi nếu thiếu biến bắt buộc.
- Web/API chỉ bind `127.0.0.1`, PostgreSQL không mở cổng; chỉ Tailscale Funnel đưa web/API ra Internet.
- GitHub Actions tự che giá trị secret trong log. Log ứng dụng: `docker compose -f docker-compose.prod.yml logs -f api web` trên máy server.

## 4. Rollback thủ công

Dùng khi cần quay lại bản trước mà không chờ pipeline. Trên máy server, trong thư mục repo:

1. **Về bản stable** (bản cuối đã qua smoke test), PowerShell:
   ```powershell
   $env:API_IMAGE="ghcr.io/dinh-hung-116/brewlite-api"; $env:WEB_IMAGE="ghcr.io/dinh-hung-116/brewlite-web"
   $env:IMAGE_TAG="stable"; $env:WEB_URL="https://datacenter.tailbd1760.ts.net:8443"
   $env:JWT_SECRET="<secret>"; $env:POSTGRES_PASSWORD="<mật khẩu>"
   docker compose -f docker-compose.prod.yml pull api web
   docker compose -f docker-compose.prod.yml up -d --wait
   ```
   (bash: `export` các biến tương tự). Muốn về một bản cụ thể thì đặt `IMAGE_TAG=<commit-sha>` cũ.
2. **Hoặc chạy lại CD của commit cũ:** Actions → CD → chọn lần chạy thành công trước → *Re-run all jobs*.
3. **Mã nguồn:** `git revert <commit>` trên nhánh mới, mở PR vào `main`; CD deploy lại bản đã revert.
4. **Database:** migration Prisma chỉ thêm (không xóa cột) nên API bản cũ vẫn chạy được trên schema mới; không chạy `migrate reset` trên production. Volume `db_data` giữ dữ liệu qua các lần deploy.
5. Kiểm tra lại `GET /health` (đúng SHA của bản cũ) và mở trang web.
