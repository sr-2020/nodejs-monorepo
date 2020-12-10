# Check out https://hub.docker.com/_/node to select a new base image
FROM node:lts

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node *.json ./
COPY --chown=node yarn.lock ./

COPY --chown=node packages/interface/*.json ./packages/interface/
COPY --chown=node packages/alice-models-manager/*.json ./packages/alice-models-manager/
COPY --chown=node packages/sr2020-common/*.json ./packages/sr2020-common/
COPY --chown=node packages/sr2020-models-manager/*.json ./packages/sr2020-models-manager/

RUN yarn

COPY --chown=node packages/interface/. ./packages/interface
COPY --chown=node packages/alice-models-manager/. ./packages/alice-models-manager
COPY --chown=node packages/sr2020-common/. ./packages/sr2020-common
COPY --chown=node packages/sr2020-models-manager/. ./packages/sr2020-models-manager

RUN npx nx build sr2020-models-manager

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0

CMD [ "node", "/home/node/app/dist/packages/sr2020-models-manager/main.js" ]
