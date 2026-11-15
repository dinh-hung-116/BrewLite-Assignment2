# Triển khai production

Nền tảng theo [ADR-006](architecture/adr/006-deploy-vercel-render-ghcr.md): **Render** chạy API (image Docker từ GHCR) + PostgreSQL, **Vercel** chạy web, **GitHub Actions** chạy CI/CD.

| Thành phần | URL production |
| --- | --- |
| Web | `https://<tên-dự-án>.vercel.app` (điền sau khi tạo) |
| API | `https://<tên-dịch-vụ>.onrender.com` |
| Health check | `https://<tên-dịch-vụ>.onrender.com/health` |

## 1. Thiết lập một lần

1. **Đẩy image đầu tiên:** merge vào `main`, job `build-push` của `cd.yml` đẩy `ghcr.io/<owner>/brewlite-api:<sha>`. Vào GitHub → Packages → `brewlite-api` → Package settings → đổi **Public** để Render kéo được image.
2. **Render PostgreSQL:** New → PostgreSQL (Free, PostgreSQL 16). Copy *Internal Database URL*.
3. **Render Web Service:** New → Web Service → *Existing image* → `ghcr.io/<owner>/brewlite-api:<sha>`. Environment:
   - `DATABASE_URL` = Internal Database URL ở bước 2
   - `JWT_SECRET` = chuỗi ngẫu nhiên dài (không commit)
   - `CORS_ORIGIN`, `FRONTEND_URL` = URL Vercel ở bước 4
   - `PAYMENT_PROVIDER=mock`, `PORT=3001`, `SEED_ON_START=true` (nạp menu mẫu; seed chạy lặp lại an toàn)
   - Health Check Path: `/health`
   - Settings → Deploy Hook → copy URL.
4. **Vercel:** Add New Project → import repo → Root Directory `apps/web` → biến `NEXT_PUBLIC_API_URL` = URL Render. Lấy `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` trong `.vercel/project.json` (chạy `npx vercel link` trong `apps/web`) và tạo token ở Account Settings → Tokens.
5. **GitHub → Settings → Secrets and variables → Actions:**
   - Secrets: `RENDER_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - Variables: `API_URL`, `WEB_URL`, `DEPLOY_ENABLED=true`
6. **Chặn merge khi CI lỗi:** Settings → Rules → Rulesets → nhánh `main`: Require a pull request, Require status checks (`api - install, lint, test, build`, `web - install, lint, test, build`, `api - integration test (PostgreSQL)`, `web - E2E Playwright (Pixel 7)`).

## 2. Luồng mỗi lần merge vào main

`build-push` (image tag commit SHA) → `deploy` (Render qua deploy hook với `imgURL`, đợi `/health` trả đúng SHA; Vercel `deploy --prebuilt --prod`) → `smoke-test` (`/health` ok + đúng SHA, `/products` có dữ liệu, trang web 200) → `mark-stable` (gắn tag `stable`).
Nếu `deploy` hoặc `smoke-test` lỗi, job `rollback` đưa API về image `stable` và chạy `vercel rollback`.

## 3. Secret và log

- Repo chỉ có `apps/api/.env.example` không chứa giá trị thật; `.env` nằm trong `.gitignore`.
- API dừng ngay nếu production thiếu `DATABASE_URL` hoặc `JWT_SECRET`.
- GitHub Actions tự che giá trị secret trong log. Log API xem ở Render → Logs, log web ở Vercel → Logs.
