# Stage 1: Frontend build
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

# Copy the rest of the required files
COPY . .

# Build the **browser** bundle
RUN npm run build cinephoria-web --configuration=production

# Stage 2: NGINX server
FROM nginx:stable-alpine3.20

# Copy cinephoria-web build to the NGINX html directory (staging)
COPY projects/cinephoria-web/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy custom pages and logo for nginx errors
COPY projects/cinephoria-web/nginx/404.html /usr/share/nginx/html/404.html
COPY projects/cinephoria-web/nginx/50x.html /usr/share/nginx/html/50x.html
COPY projects/cinephoria-web/public/assets/cinephoria-logo.webp /usr/share/nginx/html/cinephoria-logo.webp

# Copy the built files from the build stage to the NGINX html directory
COPY --from=build /app/dist/cinephoria-web/browser /usr/share/nginx/html

# Sets ownership of the files to the NGINX user
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose port 80 NGINX
EXPOSE 80

# The command to run NGINX in the foreground
CMD [ "nginx", "-g", "daemon off;" ]