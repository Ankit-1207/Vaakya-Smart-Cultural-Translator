FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy project
COPY . .

# Build the app
RUN npm run build

# Start the application
CMD ["npm", "start"]
