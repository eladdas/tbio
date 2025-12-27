FROM node:20-slim

WORKDIR /app

# Install system dependencies required for potential native modules or Puppeteer
# library dependencies if needed in future (commented out to keep image small)
# RUN apt-get update && apt-get install -y ...

# Copy package files
COPY package*.json ./

# Install dependencies
# We keep devDependencies because the build step needs 'vite', 'esbuild', 'typescript', etc.
# And 'drizzle-kit' might be needed for database operations.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm ci

# Copy source code
COPY . .

# Build the application (client and server)
RUN npm run build

# Expose the application port
ENV PORT=5000
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
