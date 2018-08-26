FROM node:carbon as node
WORKDIR /app
COPY tsconfig.base.json .
COPY package.json .
COPY yarn.lock .
COPY packages/magellan-models/package.json ./packages/magellan-models/
COPY packages/magellan-models/yarn.lock ./packages/magellan-models/
COPY packages/alice-model-engine-api/package.json ./packages/alice-model-engine-api/
COPY packages/alice-model-engine/package.json ./packages/alice-model-engine/
# COPY packages/alice-model-engine/yarn.lock ./packages/alice-model-engine/

RUN yarn --cwd packages/magellan-models
RUN yarn --cwd packages/alice-model-engine

COPY packages/magellan-models/.  ./packages/magellan-models
COPY packages/alice-model-engine-api/.  ./packages/alice-model-engine-api
COPY packages/alice-model-engine/.  ./packages/alice-model-engine

RUN yarn --cwd packages/magellan-models run build

# We use alpine instead of scratch so we have debugging tools (e.g. 'sh') inside container.
# It only adds 4.4 mb of size.
FROM alpine:latest
COPY --from=node /app/packages/magellan-models/ /app/
WORKDIR /app

CMD [ "true" ]
