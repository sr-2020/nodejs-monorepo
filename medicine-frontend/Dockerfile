# Stage 0, based on Node.js, to build and compile Angular
FROM node:carbon as node
WORKDIR /app
COPY lerna.json .
COPY package.json .
COPY yarn.lock .
COPY packages/alice-qr-lib/package.json ./packages/alice-qr-lib/
COPY packages/alice-qr-lib/yarn.lock ./packages/alice-qr-lib/
COPY packages/medicine-frontend/package.json ./packages/medicine-frontend/
COPY packages/medicine-frontend/yarn.lock ./packages/medicine-frontend/

RUN yarn global add lerna
RUN lerna bootstrap

COPY packages/alice-qr-lib/.  ./packages/alice-qr-lib
COPY packages/medicine-frontend/.  ./packages/medicine-frontend

RUN cd packages/medicine-frontend && npm run build
RUN ls packages/medicine-frontend/dist


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=node /app/packages/medicine-frontend/dist/medicine-frontend /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf