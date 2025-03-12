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

# Copy package.json and package-lock.json (if available)
COPY ./package.json ./

# Set environment variable for npm to use a writable cache directory
ENV NPM_CONFIG_CACHE=/home/node/.npm

# Create a writable npm cache directory and set correct permissions
RUN mkdir -p /home/node/.npm && chown -R 10014:10014 /home/node/.npm

# Install dependencies before switching users
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Set correct ownership for the app directory
RUN chown -R 10014:10014 /app

# Switch to the non-root user
USER 10014

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]

