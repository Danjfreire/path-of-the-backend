# Use a minimal Node 22 image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Start the app
CMD ["npm", "run", "start:dev"]
