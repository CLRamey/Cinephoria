# Backend Dockerfile
FROM node:22-alpine AS build

# mkdir /app && cd
WORKDIR /app

# Copy the backend package.json files
COPY package.json ./
COPY package-lock.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the required backend files
COPY src ./src
COPY tsconfig.json ./

# Build the backend
RUN npm run build

# Expose the port 3000
EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start", "dev" ]
CMD []