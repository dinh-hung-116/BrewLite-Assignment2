# Deployment diagram – production (Task 3.2)

![Deployment](deployment.svg) – nguồn [deployment.puml](deployment.puml)

Nền tảng theo [ADR-006](adr/006-deploy-vercel-render-ghcr.md): Vercel (web), Render (API + PostgreSQL), GitHub Container Registry, GitHub Actions.

## 1. Node, artifact và kết nối

| Node | Nền tảng | Cổng / giao thức | Artifact |
|---|---|---|---|
| Thiết bị người dùng | Trình duyệt di động / PWA | HTTPS 443 tới Vercel và Render | – |
| Web | Vercel Edge Network (CDN) | HTTPS 443 (TLS do Vercel cấp) | Bản build Next.js của `apps/web` |
| API | Render Web Service, Docker container | HTTPS 443 công khai → container port 3001 | Image `ghcr.io/dinh-hung-116/brewlite-api:<commit-sha>` từ `apps/api/Dockerfile` |
| Database | Render PostgreSQL 16, persistent disk | TCP 5432 qua internal URL, không mở ra Internet | Schema từ `apps/api/prisma/migrations` |
| Container registry | GitHub Container Registry | HTTPS (docker push/pull) | Image API gắn tag SHA và `stable` |
| CI/CD | GitHub Actions runner | HTTPS tới GHCR, Render Deploy Hook, Vercel API | `.github/workflows/ci.yml`, `cd.yml` |

## 2. Biến môi trường và secret

| Biến | Nơi khai báo | Dùng bởi |
|---|---|---|
| `DATABASE_URL` | Render (environment) | API, `prisma migrate deploy` |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Render | API |
| `CORS_ORIGIN` (URL Vercel) | Render | API |
| `PAYMENT_PROVIDER=mock` | Render | API |
| `GIT_SHA` | Build arg trong `cd.yml` | API `/health` |
| `NEXT_PUBLIC_API_URL` | Vercel | Web |
| `RENDER_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | GitHub Secrets | `cd.yml` |
| `GITHUB_TOKEN` (packages: write) | Tự cấp cho workflow | Push image GHCR |

Repository chỉ có `.env.example`; secret không in ra log (GitHub tự che giá trị secret).

## 3. Health check và log

- Docker `HEALTHCHECK` và Render health check gọi `GET /health` (trả commit SHA và trạng thái DB).
- Sau deploy, job `smoke-test` gọi `/health` (đúng SHA vừa deploy), `/products` và trang `/` của web; lỗi thì chạy job `rollback`.
- Log: API ghi stdout, xem trên Render Logs; web xem trên Vercel Logs; log pipeline trên GitHub Actions.

## 4. Ranh giới Local, CI và Production

![Local và CI](deployment-local.svg) – nguồn [deployment-local.puml](deployment-local.puml)

| Môi trường | Chạy ở đâu | DB | Secret |
|---|---|---|---|
| Local | `docker compose up --build` (web :3000, api :3001, db :5432) | Container Postgres + volume, seed mẫu | File `.env` local (không commit) |
| CI | GitHub Actions khi mở PR: Install → Lint → Unit Test → Build, integration test với service Postgres, E2E với docker compose | Postgres tạm, xóa sau job | Giá trị test cố định trong workflow |
| Production | Vercel + Render, deploy khi merge vào `main` / tag `v*` | Render PostgreSQL, không public | Render/Vercel env + GitHub Secrets |

## 5. Truy vết node → kiến trúc → mã nguồn

| Node | Container (C4) | Mã nguồn |
|---|---|---|
| Vercel – Next.js | Web App | `apps/web` |
| Render Web Service – NestJS | API, Mock Payment Service | `apps/api/src`, `apps/api/Dockerfile` |
| Render PostgreSQL | Database | `apps/api/prisma/schema.prisma`, `prisma/migrations` |
| GHCR | – (artifact) | `.github/workflows/cd.yml` (job build-push) |
| GitHub Actions | – (CI/CD) | `.github/workflows/ci.yml`, `cd.yml` |
