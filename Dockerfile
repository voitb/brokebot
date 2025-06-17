# Stage 1: Build the application
# Use the latest LTS version of Node.js for the build environment
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package management files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build args for Vite
ARG VITE_APPWRITE_ENDPOINT
ARG VITE_APPWRITE_PROJECT_ID  
ARG VITE_FRONTEND
ARG VITE_APPWRITE_DATABASE_ID
ARG VITE_STRIPE_PUBLISHABLE_KEY

# Set environment variables from build args
ENV VITE_APPWRITE_ENDPOINT=$VITE_APPWRITE_ENDPOINT
ENV VITE_APPWRITE_PROJECT_ID=$VITE_APPWRITE_PROJECT_ID
ENV VITE_FRONTEND=$VITE_FRONTEND
ENV VITE_APPWRITE_DATABASE_ID=$VITE_APPWRITE_DATABASE_ID
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Build the application
RUN pnpm build


# Stage 2: Serve the application with Nginx
# Use a lightweight, stable version of Nginx
FROM nginx:stable-alpine

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"] 