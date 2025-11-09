# Stage 1 — build
FROM node:24-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (npm install handles optional deps better than npm ci)
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:alpine AS prod
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]