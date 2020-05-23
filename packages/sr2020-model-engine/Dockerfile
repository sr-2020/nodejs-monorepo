# Check out https://hub.docker.com/_/node to select a new base image
FROM node:10-slim

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node *.json ./
COPY --chown=node yarn.lock ./

COPY --chown=node packages/sr2020-model-engine/*.json ./packages/sr2020-model-engine/
COPY --chown=node packages/interface/*.json ./packages/interface/
COPY --chown=node packages/alice-model-engine/*.json ./packages/alice-model-engine/

RUN yarn

COPY --chown=node packages/sr2020-model-engine/. ./packages/sr2020-model-engine
COPY --chown=node packages/interface/. ./packages/interface
COPY --chown=node packages/alice-model-engine/. ./packages/alice-model-engine

RUN yarn --cwd packages/sr2020-model-engine run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0

CMD [ "yarn", "--cwd", "packages/sr2020-model-engine/", "start" ]
