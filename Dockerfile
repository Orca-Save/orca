FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

# Command to run your app
CMD ["npm", "start"]
