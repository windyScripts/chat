# Use official Node.js 18 Alpine image (small + fast)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the app source code
COPY . .

# Expose the port your app uses
EXPOSE 8080

# Start the app
CMD ["node", "app.mjs"]
