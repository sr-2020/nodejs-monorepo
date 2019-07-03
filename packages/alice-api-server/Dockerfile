# Stage 0, based on Node.js, to build and compile Angular
FROM node:carbon as node
WORKDIR /app
COPY *.json ./
COPY yarn.lock .
COPY packages/alice-api-server/package.json ./packages/alice-api-server/
COPY packages/alice-api-server/yarn.lock ./packages/alice-api-server/
COPY packages/interface/package.json ./packages/interface/

RUN yarn
RUN yarn run deps

COPY packages/alice-api-server/.  ./packages/alice-api-server
COPY packages/interface/.  ./packages/interface

RUN yarn --cwd packages/alice-api-server run build

CMD [ "node", "./packages/alice-api-server/dist/main.js" ]
