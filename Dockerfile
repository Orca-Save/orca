FROM node:20-alpine

RUN apk add --no-cache postgresql-client
# RUN apk add openssh 
COPY sshd_config /etc/ssh/

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
# RUN chmod +x generate-env-file.sh && ./generate-env-file.sh

RUN npx prisma generate
RUN npm run build


EXPOSE 8080 2222

CMD ["npm", "start"]
