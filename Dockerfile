# Frontend Dockerfile
FROM node:22-alpine AS build

# mkdir /app && cd
WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY package-lock.json ./

# Run a clean install of the dependencies
RUN npm ci

# Install the Angular CLI globally
RUN npm i -g @angular/cli@18.2.13

# Install bash
RUN apk add --no-cache netcat-openbsd 

# Copy all source code & test files to container
COPY . .

ENTRYPOINT ["/bin/sh"]
CMD ["-c", "while true; do sleep 30; done"]