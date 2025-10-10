# Use Node.js official image as base
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force


# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

# Copy the rest of the application code
COPY . .


# Change ownership of the app directory to the nodejs user
RUN chown -R nodeapp:nodejs /app
USER nodeapp

# Expose the port the app runs on
EXPOSE 5000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:5000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]