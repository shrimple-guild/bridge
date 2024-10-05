#!/bin/bash

# Perform a git pull to fetch the latest changes
echo "Pulling latest changes from Git..."
git pull || { echo "Failed to pull from Git"; exit 1; }

# Run yarn prestart
echo "Running yarn prestart..."
yarn prestart || { echo "Failed to run yarn prestart"; exit 1; }

# Restart the service (use the current directory name as the service name)
DIRECTORY_NAME=$(basename "$PWD")

echo "Restarting service: $DIRECTORY_NAME"
sudo service "$DIRECTORY_NAME" restart || { echo "Failed to restart the service"; exit 1; }

echo "Script executed successfully."