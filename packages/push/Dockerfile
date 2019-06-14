# Check out https://hub.docker.com/_/node to select a new base image
FROM node:10-slim

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node *.json ./
COPY --chown=node yarn.lock ./

COPY --chown=node packages/push/*.json ./packages/push/
COPY --chown=node packages/interface/*.json ./packages/interface/

RUN yarn

COPY --chown=node packages/push/. ./packages/push
COPY --chown=node packages/interface/. ./packages/interface

RUN yarn --cwd packages/push run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD [ "yarn", "--cwd", "packages/push/", "start" ]

