# 1. Etapa de dependencias
FROM node:18-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install

# 2. Etapa de construcción
FROM node:18-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client (importante para el build)
RUN npx prisma generate

# Next.js colecta datos anónimos, los desactivamos
ENV NEXT_TELEMETRY_DISABLED 1

# Construir la aplicación (ignora scripts que intentan descargar FFmpeg manualmente si fallan)
RUN npm run build

# 3. Etapa de ejecución
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# INSTALAR FFMPEG FULL (La clave de todo)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libfreetype6 \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios (Next.js Standalone mode si se usa, o normal)
# Para máxima simplicidad en Railway sin pre-configuración compleja, usamos el build estándar
COPY --from=builder /app ./

# Aseguramos permisos para la carpeta temporal de videos
RUN mkdir -p tmp/video-out && chown -R nextjs:nodejs tmp/video-out

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
