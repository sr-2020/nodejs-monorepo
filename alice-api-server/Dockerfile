# Stage 0, based on Node.js, to build and compile Angular
FROM node:carbon as node
WORKDIR /app
COPY lerna.json .
COPY package.json .
COPY yarn.lock .
COPY packages/alice-api-server/package.json ./packages/alice-api-server/
COPY packages/alice-api-server/yarn.lock ./packages/alice-api-server/

RUN yarn global add lerna
RUN lerna bootstrap

COPY packages/alice-api-server/.  ./packages/alice-api-server

RUN cd packages/alice-api-server && npm run build

CMD [ "node", "./packages/alice-api-server/dist/out-tsc/main.js" ]
