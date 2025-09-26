FROM node:18-bullseye AS build

WORKDIR /usr/src/app
COPY package*.json ./

RUN apt update -yq && apt upgrade -yq

RUN npm ci --only=production

COPY . .

RUN npm run build

FROM node:18-bullseye
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/server.ts ./src/server.ts

CMD node dist/server.js