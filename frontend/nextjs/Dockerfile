FROM node:18.17.0-alpine

WORKDIR /app

# Set npm cache directory inside /app
ENV NPM_CONFIG_CACHE=/app/.npm
ENV CHOREO_GPT_RESEARCHER_CHOREOAPIKEY=chk_eyJjb25uZWN0aW9uLWlkIjoiMDFmMDA0ZGItOWVmOS0xYjgwLWIyOTYtZDFkZTllMTdjMTE2In0=cxm3RA
ENV CHOREO_GPT_RESEARCHER_SERVICEURL=ws://gpt-researcher-backend-3418791020:8000/
COPY ./package.json ./
RUN npm install --legacy-peer-deps

COPY . .
# Ensure correct ownership of necessary directories
RUN mkdir -p /app/.npm /app/.next/cache/images /app/node_modules \
    && chown -R 10014:0 /app

RUN npm run build

USER 10014

EXPOSE 3000
CMD ["npm", "run", "start"]
