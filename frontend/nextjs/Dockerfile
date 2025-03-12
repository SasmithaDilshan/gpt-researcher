# FROM node:18.17.0-alpine as builder
# WORKDIR /app
# COPY ./package.json ./
# RUN npm install --legacy-peer-deps
# COPY . .
# RUN npm run build

# FROM nginx
# USER 10014
# EXPOSE 3000
# COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# COPY --from=builder /app/build /usr/share/nginx/html
FROM node:18.17.0-alpine
WORKDIR /app
COPY ./package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build
USER 10014
EXPOSE 3000
CMD ["npm", "run", "start"]