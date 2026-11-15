# BrewLite – Assignment 2

Ứng dụng đặt đồ uống không tiền mặt (Next.js + NestJS + PostgreSQL + Docker), làm theo chuỗi Requirements → Modeling → Architecture → Sprint 1 → Sprint 2/CI/CD.

## Tài liệu

| Task | Nội dung | Thư mục |
|---|---|---|
| 1 | Bối cảnh, stakeholder, phạm vi; SRS; use case | [docs/requirements](docs/requirements) |
| 2 | Activity, sequence, class diagram | [docs/diagrams](docs/diagrams) |
| 3 | Kiến trúc C4, ADR, deployment diagram | [docs/architecture](docs/architecture) |
| 4 | Sprint 1: `apps/web`, `apps/api`, CI | [apps](apps), [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| 5 | Sprint 2: MVP, kiểm thử, docker compose, CD, release | [docs/deployment.md](docs/deployment.md), [docs/release](docs/release), [docs/sprints](docs/sprints) |

Sơ đồ viết bằng PlantUML; sinh lại ảnh: `plantuml -tsvg docs/diagrams/*.puml docs/architecture/*.puml`.

## Chạy nhanh

```bash
docker compose up -d --build                       # db + api + web
docker compose run --rm api npx prisma db seed     # dữ liệu mẫu
```

Web http://localhost:3000 · API http://localhost:3001 · Health http://localhost:3001/health · Swagger http://localhost:3001/api

Thanh toán dùng cổng mô phỏng: chọn Ví điện tử để thành công, hoặc nhập thẻ đuôi `0002` để thử thanh toán lỗi.

## Kiểm thử

| Loại | Lệnh |
| --- | --- |
| Unit API | `cd apps/api && npm test` |
| Unit web | `cd apps/web && npm test` |
| Integration (cần PostgreSQL đã migrate + seed) | `cd apps/api && npm run test:e2e` |
| E2E Playwright (cần stack đang chạy) | `cd apps/web && npx playwright test` |

## Quy trình làm việc

**Nhánh và pull request.** `main` luôn chạy được và là bản deploy production. Mỗi task/tính năng làm trên nhánh riêng tách từ `main`:

| Loại | Mẫu tên nhánh | Ví dụ |
| --- | --- | --- |
| Tài liệu | `docs/<mô-tả>` | `docs/task-1-requirements` |
| Tính năng | `feat/<mô-tả>` | `feat/task-5-sprint2` |
| Sửa lỗi | `fix/<mô-tả>` | `fix/header-mobile` |

Mở pull request vào `main` theo mẫu `.github/pull_request_template.md`; CI (`ci.yml`) chạy Install → Lint → Test → Build cho `api` và `web`, kèm integration test trên PostgreSQL và E2E Playwright. Chỉ merge khi CI xanh và có ít nhất một người review; merge bằng *merge commit* để giữ lịch sử từng task. Mọi thay đổi yêu cầu, sơ đồ hoặc kiến trúc cũng đi qua PR và ghi lý do trong mô tả PR.

**Quy ước commit** (Conventional Commits): `<loại>(<phạm vi>): <mô tả>`, loại gồm `feat`, `fix`, `docs`, `test`, `ci`, `refactor`, `chore`. Ví dụ: `feat(payments): cổng thanh toán mô phỏng Ví/Thẻ`.

**Definition of Done.** Một hạng mục backlog được tính là xong khi:
1. Đáp ứng tiêu chí chấp nhận trong `docs/requirements/srs.md`.
2. Có unit test (và integration/E2E nếu chạm luồng đặt và thanh toán), CI xanh.
3. Lint không lỗi, không có secret trong mã nguồn.
4. Đã review và merge vào `main` qua pull request.
5. Tài liệu và `docs/traceability-matrix.md` được cập nhật.
6. Chạy được bằng `docker compose` ở local và qua smoke test sau khi deploy.

Product Backlog theo sprint: [docs/sprints/product-backlog.md](docs/sprints/product-backlog.md).

## Build, deploy và rollback

```bash
cd apps/api && npm ci --legacy-peer-deps && npm run build   # build API
cd apps/web && npm ci --legacy-peer-deps && npm run build   # build web
docker build -t brewlite-api apps/api                       # image API
```

Deploy tự động bằng `.github/workflows/cd.yml` khi merge vào `main`: build image tag theo commit SHA → push GHCR → deploy Render (API, chạy `prisma migrate deploy`) và Vercel (web) → smoke test `/health`, `/products`, trang web → gắn tag `stable`. Smoke test lỗi thì job rollback đưa Render về image `:stable` và chạy `vercel rollback`. Rollback thủ công và cách cấu hình secret: [docs/deployment.md](docs/deployment.md).

## Tài liệu khác

- Yêu cầu: `docs/requirements/` · Sơ đồ: `docs/diagrams/` · Kiến trúc + ADR: `docs/architecture/`
- Triển khai: `docs/deployment.md` · Truy vết: `docs/traceability-matrix.md`
- Release notes: `docs/release/v1.0.0.md` · Sprint Review: `docs/sprints/sprint-review.md` · Retrospective: `docs/sprints/retrospective.md`

