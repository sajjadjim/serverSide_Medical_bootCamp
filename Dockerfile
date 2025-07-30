# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port (change if your app uses a different port)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]