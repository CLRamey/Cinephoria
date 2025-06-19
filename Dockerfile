# Frontend Dockerfile
FROM node:22-bullseye-slim AS build

# mkdir /app && cd
WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY package-lock.json ./

# Run a clean install of the dependencies
RUN npm ci

# Install the Angular CLI globally
RUN npm i -g @angular/cli@18.2.13

# Install necessary packages for testing
RUN apt-get update && apt-get install -y \
    chromium \
    netcat-openbsd \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Disable analytics
RUN npx ng analytics off -g

# Copy all source code & test files to container
COPY . .

RUN npm run build:frontend

ENTRYPOINT ["/bin/sh"]
CMD ["-c", "while true; do sleep 30; done"]