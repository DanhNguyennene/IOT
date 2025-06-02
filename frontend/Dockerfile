FROM node:24-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

ENV HOST=$HOST

CMD ["npm", "start"]
