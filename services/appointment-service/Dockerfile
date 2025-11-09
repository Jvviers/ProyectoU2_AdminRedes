# Stage 1: Build the application
FROM node:18.18.2-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Stage 2: Create the production image
FROM node:18.18.2-alpine

# Add metadata labels
LABEL maintainer="Your Name <your.email@example.com>"
LABEL description="Appointment service for the project."

# Create a non-privileged user and group
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for production
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the rest of the application files
COPY . .

# Change ownership of the files to the non-privileged user
RUN chown -R nodejs:nodejs /app

# Switch to the non-privileged user
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application
CMD ["node", "src/index.js"]
