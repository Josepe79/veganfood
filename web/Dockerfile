# 1. Etapa de dependencias
FROM node:20.12-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install

# 2. Etapa de construcción
FROM node:20.12-slim AS builder
WORKDIR /app
# IMPORTANTE: Necesitamos openssl también aquí para npx prisma generate
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Next.js build (Sin db push, eso se hace en runtime)
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3. Etapa de ejecución
FROM node:20.12-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# INSTALAR FFMPEG FULL Y OPENSSL (Necesario para Prisma en runtime)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libfreetype6 \
    fontconfig \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios (Next.js Standalone mode si se usa, o normal)
# Para máxima simplicidad en Railway sin pre-configuración compleja, usamos el build estándar
COPY --from=builder /app ./

# Aseguramos permisos para toda la carpeta temporal (voces, música, videos)
RUN mkdir -p tmp && chown -R nextjs:nodejs /app/tmp

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Sincronizar base de datos y arrancar
CMD npx prisma db push && npm start
