# 1. Etapa de dependencias
FROM node:20.12-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install

# 2. Etapa de construcción
FROM node:20.12-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Next.js build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3. Etapa de ejecución
FROM node:20.12-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Crear usuario de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app ./

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Arrancamos directamente (el db push ya lo hicimos o lo haremos manualmente)
CMD ["npm", "start"]
