FROM node:20-alpine

RUN apk add --no-cache postgresql-client
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
