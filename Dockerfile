FROM node:22-alpine AS dependencies

RUN apk add --no-cache zstd

WORKDIR /app
COPY . .

RUN npm i

FROM dependencies AS puzzle-exporter

FROM dependencies AS app

RUN npm run build -w shared
RUN npm run build -w server
RUN npm run build -w client

EXPOSE 8080

CMD ["npm", "start"]
