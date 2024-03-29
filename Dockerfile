FROM node:16-alpine as base
WORKDIR /app

COPY package.json yarn.lock ./

FROM base as dependencies

RUN yarn install --cache-folder ./ycache --immutable --immutable-cache --production=false
RUN rm -rf ./yache

FROM dependencies as build

ENV NODE_ENV=production
COPY src ./src
COPY @types ./@types
COPY knexfile.js tsconfig.json ./
RUN yarn run build


FROM node:16-alpine
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

COPY --from=build /app/node_modules/ ./node_modules/
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/package.json ./
COPY ./schema.graphql ./
COPY ./sql ./sql

EXPOSE 80
CMD ["yarn", "node", "dist/src/index.js"]