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

## Tài liệu khác

- Yêu cầu: `docs/requirements/` · Sơ đồ: `docs/diagrams/` · Kiến trúc + ADR: `docs/architecture/`
- Triển khai: `docs/deployment.md` · Truy vết: `docs/traceability-matrix.md`
- Release notes: `docs/release/v1.0.0.md` · Retrospective: `docs/sprints/retrospective.md`

