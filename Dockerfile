# Stage 1: Build du frontend
FROM node:24-alpine AS frontend-builder

WORKDIR /app

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Workspace-aware install: root package.json declares the `workspaces` array,
# so every workspace package.json must be present on disk for npm to resolve
# the local `@copro-pilot/shared-enums` symlink. shared-enums itself has no
# build step (plain ESM source) so we copy its files alongside.
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-enums/ ./packages/shared-enums/

RUN npm install --legacy-peer-deps --workspaces --include-workspace-root && \
    npm cache clean --force

# Copy frontend source and build
COPY apps/frontend/ ./apps/frontend/
RUN cd apps/frontend && npx vite build

# Stage 2: Production image
FROM node:24-alpine

LABEL org.opencontainers.image.title="CoproPilot"
LABEL org.opencontainers.image.description="Plateforme de gestion de copropriété pour syndic professionnel"

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Install backend prod deps with workspace resolution so the local
# @copro-pilot/shared-enums symlink works at runtime. Frontend package.json
# is required because the root `workspaces` glob enumerates it; npm only
# installs deps for the backend workspace thanks to --workspace filter.
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared-enums/ ./packages/shared-enums/

RUN npm install --omit=dev --workspace=@copro-pilot/backend --include-workspace-root && \
    npm cache clean --force

# Copy backend source
COPY apps/backend/ ./apps/backend/

# Copy frontend build
COPY --from=frontend-builder /app/apps/frontend/dist /app/frontend-dist

RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:3001/api/health || exit 1

CMD ["node", "apps/backend/src/index.js"]
