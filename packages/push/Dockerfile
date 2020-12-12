# Check out https://hub.docker.com/_/node to select a new base image
FROM node:lts

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node *.json ./
COPY --chown=node yarn.lock ./

COPY --chown=node packages/push/*.json ./packages/push/
COPY --chown=node packages/alice-common/*.json ./packages/alice-common/

RUN yarn

COPY --chown=node packages/push/. ./packages/push
COPY --chown=node packages/alice-common/. ./packages/alice-common

RUN npx nx build push

# Bind to all network alice-commons so that it can be mapped to the host OS
ENV HOST=0.0.0.0

CMD [ "node", "/home/node/app/dist/packages/push/main.js" ]

