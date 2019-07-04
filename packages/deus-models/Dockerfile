# Check out https://hub.docker.com/_/node to select a new base image
FROM node:10-slim

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node *.json ./
COPY --chown=node yarn.lock ./

COPY --chown=node packages/deus-models/*.json ./packages/deus-models/
COPY --chown=node packages/interface/*.json ./packages/interface/
COPY --chown=node packages/alice-model-engine/*.json ./packages/alice-model-engine/

RUN yarn

COPY --chown=node packages/deus-models/. ./packages/deus-models
COPY --chown=node packages/interface/. ./packages/interface
COPY --chown=node packages/alice-model-engine/. ./packages/alice-model-engine

RUN yarn --cwd packages/deus-models run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0

CMD [ "yarn", "--cwd", "packages/deus-models/", "start" ]
