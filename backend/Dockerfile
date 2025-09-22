# Stage 1 : Build backend
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

# Stage 2 : Production image, copy all the files and run next
FROM node:22-alpine AS production

# Create non-root user and group
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

# Create app directory
WORKDIR /app

# Copy the built files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Give ownership of the /app folder to the non-root user
RUN chown -R nodeuser:nodegroup /app
# Switch to non-root user
USER nodeuser

# Expose the port 3000
EXPOSE 3000

ENTRYPOINT ["npm", "run", "start", "prod" ]