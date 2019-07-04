# Check out https://hub.docker.com/_/node to select a new base image
FROM node:10-slim

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node *.json ./
COPY --chown=node yarn.lock ./

COPY --chown=node packages/models-manager/*.json ./packages/models-manager/
COPY --chown=node packages/interface/*.json ./packages/interface/

RUN yarn

COPY --chown=node packages/models-manager/. ./packages/models-manager
COPY --chown=node packages/interface/. ./packages/interface

RUN yarn --cwd packages/models-manager run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0

CMD [ "yarn", "--cwd", "packages/models-manager/", "start" ]
