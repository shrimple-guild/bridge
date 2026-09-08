#!/bin/bash
git pull || { echo "Failed to pull from Git"; exit 1; }
yarn || { echo "Failed to update packages."; exit 1; }
yarn prestart || { echo "Failed to run yarn prestart"; exit 1; }
DIRECTORY_NAME=$(basename "$PWD")
systemctl --user restart "$DIRECTORY_NAME" || { echo "Failed to restart the service"; exit 1; }
echo "Script executed successfully."