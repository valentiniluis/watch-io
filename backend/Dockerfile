FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# RUN chmod +x entrypoint.sh

EXPOSE 8080

# ENTRYPOINT ["/app/entrypoint.sh"]