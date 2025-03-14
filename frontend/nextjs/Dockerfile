FROM node:18.17.0-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV NEXT_TELEMETRY_DISABLED 1
USER 10014
EXPOSE 3000
CMD ["npm", "run", "start"]