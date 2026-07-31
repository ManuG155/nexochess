FROM node:22-alpine

RUN apk add --no-cache zstd

WORKDIR /app
COPY . .

RUN npm i
RUN npm run build -w shared
RUN npm run build -w server
RUN npm run build -w client

EXPOSE 8080

CMD ["npm", "start"]
