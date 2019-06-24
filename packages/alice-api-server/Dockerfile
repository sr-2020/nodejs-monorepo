# Stage 0, based on Node.js, to build and compile Angular
FROM node:carbon as node
WORKDIR /app
COPY *.json ./
COPY yarn.lock .
COPY packages/alice-api-server/package.json ./packages/alice-api-server/
COPY packages/alice-api-server/yarn.lock ./packages/alice-api-server/
COPY packages/alice-model-engine-api/package.json ./packages/alice-model-engine-api/

RUN yarn
RUN yarn run deps

COPY packages/alice-api-server/.  ./packages/alice-api-server
COPY packages/alice-model-engine-api/.  ./packages/alice-model-engine-api

RUN yarn --cwd packages/alice-api-server run build

CMD [ "node", "./packages/alice-api-server/dist/main.js" ]
