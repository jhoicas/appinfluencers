# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Build arguments para variables de entorno en tiempo de compilación
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FACEBOOK_APP_ID

# Copiar código y construir
COPY . .
RUN npm run build

# Imagen de producción
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copiar build y dependencias necesarias
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Exponer puerto
EXPOSE 3000

# Iniciar servidor de producción
CMD ["npm", "start"]