# Stage 1: Build du frontend
FROM node:24-alpine AS frontend-builder

WORKDIR /app

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Copy root package.json (version only)
COPY package.json /tmp/package.json
RUN node -e "const p=JSON.parse(require('fs').readFileSync('/tmp/package.json','utf8')); console.log(JSON.stringify({name:p.name,version:p.version,private:true}))" > ./package.json

# Install frontend dependencies
COPY apps/frontend/package*.json ./apps/frontend/
WORKDIR /app/apps/frontend
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy frontend source and build
WORKDIR /app
COPY apps/frontend/ ./apps/frontend/
RUN cd apps/frontend && npm run build

# Stage 2: Production image
FROM node:24-alpine

LABEL org.opencontainers.image.title="CoproPilot"
LABEL org.opencontainers.image.description="Plateforme de gestion de copropriété pour syndic professionnel"

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Install backend dependencies
COPY apps/backend/package*.json ./apps/backend/
RUN cd apps/backend && npm install --only=production && npm cache clean --force && \
    chown -R nodejs:nodejs /app/apps/backend/node_modules

# Copy backend source
COPY --chown=nodejs:nodejs apps/backend/ ./apps/backend/

# Copy frontend build
COPY --chown=nodejs:nodejs --from=frontend-builder /app/apps/frontend/dist /app/frontend-dist

# Create log directory
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "apps/backend/src/index.js"]
