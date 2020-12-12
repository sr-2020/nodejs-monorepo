# Check out https://hub.docker.com/_/node to select a new base image
FROM node:lts

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node *.json ./
COPY --chown=node yarn.lock ./

COPY --chown=node packages/deus-model-engine/*.json ./packages/deus-model-engine/
COPY --chown=node packages/alice-common/*.json ./packages/alice-common/
COPY --chown=node packages/alice-model-engine/*.json ./packages/alice-model-engine/

RUN yarn

COPY --chown=node packages/deus-model-engine/. ./packages/deus-model-engine
COPY --chown=node packages/alice-common/. ./packages/alice-common
COPY --chown=node packages/alice-model-engine/. ./packages/alice-model-engine

RUN yarn --cwd packages/deus-model-engine run build

# Bind to all network alice-commons so that it can be mapped to the host OS
ENV HOST=0.0.0.0

CMD [ "yarn", "--cwd", "packages/deus-model-engine/", "start" ]
