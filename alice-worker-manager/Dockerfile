FROM node:carbon

CMD [ "node", "build/worker_manager_runner.js", "-c", "../config.docker.js" ]


# Stage 0, based on Node.js, to build and compile Angular
FROM node:carbon as node
WORKDIR /app
COPY *.json ./
COPY yarn.lock .
COPY packages/alice-worker-manager/package.json ./packages/alice-worker-manager/
COPY packages/alice-worker-manager/yarn.lock ./packages/alice-worker-manager/

COPY packages/alice-model-engine-api/package.json ./packages/alice-model-engine-api/

COPY packages/alice-model-engine/package.json ./packages/alice-model-engine/
COPY packages/alice-model-engine/yarn.lock ./packages/alice-model-engine/

RUN yarn
RUN yarn run deps

COPY packages/alice-worker-manager/.  ./packages/alice-worker-manager
COPY packages/alice-model-engine-api/.  ./packages/alice-model-engine-api
COPY packages/alice-model-engine/.  ./packages/alice-model-engine

RUN yarn --cwd packages/alice-worker-manager run build

CMD [ "node", "./packages/alice-worker-manager/build/worker_manager_runner.js", "-c", "./packages/alice-worker-manager/config.docker.js" ]
