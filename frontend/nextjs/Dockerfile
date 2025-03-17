FROM node:18.17.0-alpine

WORKDIR /app

# Set npm cache directory inside /app
ENV NPM_CONFIG_CACHE=/app/.npm

COPY ./package.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Ensure correct ownership of necessary directories
RUN mkdir -p /app/.npm /app/.next/cache/images /app/node_modules \
    && chown -R 10014:0 /app

RUN npm run build

USER 10014
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
CMD ["npm", "run", "start"]
