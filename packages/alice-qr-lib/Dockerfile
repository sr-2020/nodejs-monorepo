# Stage 0, based on Node.js, to build and compile Angular
FROM node:carbon as node
WORKDIR /app
COPY *.json ./
COPY yarn.lock .
COPY packages/alice-qr-lib/package.json ./packages/alice-qr-lib/
COPY packages/alice-qr-lib/yarn.lock ./packages/alice-qr-lib/

RUN yarn
RUN yarn run deps

COPY packages/alice-qr-lib/.  ./packages/alice-qr-lib

RUN yarn --cwd packages/alice-qr-lib run build

CMD [ "node", "./packages/alice-qr-lib/dist/main.js" ]