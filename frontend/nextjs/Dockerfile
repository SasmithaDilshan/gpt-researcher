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

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY ./package.json ./

# Set npm cache to a writable location
RUN mkdir -p /home/node/.npm && chown -R 10014:10014 /home/node/.npm
RUN npm config set cache /home/node/.npm

# Install dependencies with the correct permissions
RUN npm install --legacy-peer-deps

# Copy remaining files
COPY . .

# Build the application
RUN npm run build

# Set correct permissions for the app directory
RUN chown -R 10014:10014 /app

# Switch to non-root user
USER 10014

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
