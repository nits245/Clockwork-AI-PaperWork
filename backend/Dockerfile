# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the backend will run on (defined by BACKEND_PORT in your .env file)
EXPOSE ${BACKEND_PORT}

# Start the app
CMD ["node", "index.js"]
