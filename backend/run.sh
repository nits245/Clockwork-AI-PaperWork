#!/bin/bash

# Load environment variables from the .env file
export $(grep -v '^#' .env | xargs)

# Ensure BACKEND_PORT is set, default to 8800 if not
BACKEND_PORT=${BACKEND_PORT:-8800}

# Step 1: Build the Docker image
echo "Building the Docker image for the backend..."
docker build -t clockwork-backend .

# Step 2: Run the Docker container
echo "Running the Docker container on port $BACKEND_PORT..."
docker run -d -p "$BACKEND_PORT":"$BACKEND_PORT" --name clockwork-backend --env-file .env clockwork-backend

echo "Backend is now running on http://localhost:$BACKEND_PORT"
