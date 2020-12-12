FROM node:carbon as node
WORKDIR /app
COPY *.json ./
COPY yarn.lock .
COPY packages/magellan-model-engine/package.json ./packages/magellan-model-engine/
COPY packages/magellan-model-engine/yarn.lock ./packages/magellan-model-engine/
COPY packages/alice-common/package.json ./packages/alice-common/
COPY packages/alice-model-engine/package.json ./packages/alice-model-engine/
COPY packages/alice-model-engine/yarn.lock ./packages/alice-model-engine/

RUN yarn
RUN yarn run deps

COPY packages/magellan-model-engine/.  ./packages/magellan-model-engine
COPY packages/alice-common/.  ./packages/alice-common
COPY packages/alice-model-engine/.  ./packages/alice-model-engine

RUN yarn --cwd packages/magellan-model-engine run build

# We use alpine instead of scratch so we have debugging tools (e.g. 'sh') inside container.
# It only adds 4.4 mb of size.
FROM alpine:latest
COPY --from=node /app/packages/magellan-model-engine/build/magellan-model-engine /app/build
COPY --from=node /app/packages/magellan-model-engine/catalogs /app/catalogs
COPY --from=node /app/packages/magellan-model-engine/data_samples /app/data_samples
COPY --from=node /app/packages/magellan-model-engine/node_modules /app/node_modules
WORKDIR /app

CMD [ "true" ]
