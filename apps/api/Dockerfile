# --- Stage 1: cài dependency + generate Prisma Client ---
FROM node:22-bookworm-slim AS deps
WORKDIR /app
# Copy schema trước để postinstall (prisma generate) chạy được
COPY package.json package-lock.json ./
COPY prisma ./prisma
# --legacy-peer-deps: lockfile có optional peer magicast@^0.3.5 của @prisma/config/c12
# mà npm ci strict coi là thiếu, dù npm install bỏ qua optional peer đó
RUN npm ci --legacy-peer-deps

# --- Stage 2: build TypeScript ---
FROM deps AS build
COPY . .
RUN npm run build

# --- Stage 3: runtime ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ARG GIT_SHA=dev
ENV NODE_ENV=production
ENV GIT_SHA=$GIT_SHA
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3001

# NFR-04: /health kiểm tra cả kết nối DB
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# migrate deploy là idempotent: DB đã có migration thì bỏ qua
# SEED_ON_START=true nạp dữ liệu mẫu (seed chạy lặp lại an toàn) – dùng cho Render gói miễn phí không có shell
CMD ["sh", "-c", "npx prisma migrate deploy && if [ \"$SEED_ON_START\" = \"true\" ]; then npx prisma db seed; fi && node dist/main.js"]
