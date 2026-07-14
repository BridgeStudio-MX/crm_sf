# parks-twenty-service — API Parks (CEO, comité, CxC, comercial, legal)
FROM node:24-bookworm-slim AS build

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

RUN npm run build \
  && mkdir -p dist/src/templates \
  && cp -R src/templates/. dist/src/templates/

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY src/templates ./src/templates

EXPOSE 3002

HEALTHCHECK --interval=15s --timeout=5s --retries=10 \
  CMD curl --fail http://localhost:3002/health || exit 1

CMD ["node", "dist/src/index.js"]
