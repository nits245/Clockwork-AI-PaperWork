#!/bin/bash

# This script builds and runs the Docker container for the frontend

# Set default port for the frontend
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Step 1: Build the Docker image
echo "Building the Docker image for the frontend..."
docker build -t clockwork-frontend .

# Step 2: Run the Docker container
echo "Running the Docker container..."
docker run -d -p "$FRONTEND_PORT":80 --name clockwork-frontend clockwork-frontend

echo "Frontend is now running on http://localhost:$FRONTEND_PORT"
