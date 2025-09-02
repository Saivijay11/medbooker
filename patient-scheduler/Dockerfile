# patient-scheduler/Dockerfile

# 1) deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY patient-scheduler/package*.json ./
RUN npm ci

# 2) build
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY patient-scheduler/ ./
# If you use NEXT_PUBLIC_* envs, add them to patient-scheduler/.env.production
RUN npm run build

# 3) runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
# install only prod deps for runtime
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm","start","--","-p","3000"]
