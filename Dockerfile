FROM node:16
WORKDIR /app

ENV NODE_ENV=production
ENV REDIS_URL=
ENV RABBIT_URL=

ENV MYSQL_HOST=
ENV MYSQL_PORT=3306
ENV MYSQL_DATABASE=regenbogenice
ENV MYSQL_USER=regenbogenice
ENV MYSQL_PASSWORD=

ENV HTTP_HOST=0.0.0.0
ENV HTTP_PORT=80
EXPOSE 80

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install --production=false

COPY ./tsconfig.json .
COPY ./src ./src
COPY ./knexfile.js .

RUN yarn run build

CMD ["yarn", "node", "dist/src/index.js"]