# BASE - comum para dev e prod
FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install


# DEV - executando servidor de desenvolvimento vite
FROM base AS development

COPY . .

# Garante que o script de entrypoint tenha permissão de execução
RUN chmod +x /app/entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["/app/entrypoint.sh"]


# BUILD - Compilação para prod
FROM base AS build

COPY . .

# Argumentos de build se precisar injetar variáveis em tempo de compilação
ARG VITE_BACKEND_BASE

ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_BACKEND_BASE=$VITE_BACKEND_BASE

ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build


# PROD - Nginx servindo arquivos estáticos
FROM nginx:stable-alpine AS production

# Copia o build do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]