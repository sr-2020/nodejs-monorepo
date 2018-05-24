# Stage 0, based on Node.js, to build and compile Angular
FROM node:carbon as node
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --prod

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.13
COPY --from=node /app/dist/medicine-frontend /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf