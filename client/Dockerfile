FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env.production .env

RUN npx prisma generate
RUN npm run build

RUN rm .env.*
RUN rm .env

EXPOSE 8080

CMD ["npm", "start"] 