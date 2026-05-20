FROM node:24-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runner-base

RUN addgroup -S project_service \
    && adduser -S project_service -G project_service
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=builder /app/dist ./dist
USER project_service
EXPOSE 7100

FROM runner-base AS development

USER project_service
ENV NODE_ENV=development
COPY --from=builder --chown=root:root --chmod=755 /app/src ./src
CMD ["node", "dist/index.js"]

FROM runner-base AS production

USER project_service
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
