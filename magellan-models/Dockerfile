FROM node:carbon as node
WORKDIR /app
COPY lerna.json .
COPY package.json .
COPY yarn.lock .
COPY packages/magellan-models/package.json ./packages/magellan-models/
COPY packages/magellan-models/yarn.lock ./packages/magellan-models/

RUN yarn global add lerna
RUN lerna bootstrap

COPY packages/magellan-models/.  ./packages/magellan-models

RUN cd packages/magellan-models && npm run build


# We use alpine instead of scratch so we have debugging tools (e.g. 'sh') inside container.
# It only adds 4.4 mb of size.
FROM alpine:latest
COPY --from=node /app/packages/magellan-models/ /app/
WORKDIR /app

CMD [ "true" ]
