#!/bin/bash

# Check if prod flag is set
prod=false
while getopts "p" option; do
    case $option in
        p) prod=true;;
    esac
done

echo "Logging in to Docker Hub..."
docker login
if [ $? -ne 0 ]; then
    echo "Docker login failed."
    exit 1
fi

dockerfile="Dockerfile.server"
dockerHubRepository="reharly20/orca-api"
dockerTag="latest"

startTime=$(date +%s)

echo "Building Docker image using $dockerfile... $dockerHubRepository : $dockerTag"
docker build -f "$dockerfile" -t "${dockerHubRepository}:${dockerTag}" .
if [ $? -ne 0 ]; then
    echo "Docker image build failed."
    exit 1
fi

echo "Pushing Docker image to Docker Hub..."
docker push "${dockerHubRepository}:${dockerTag}"
if [ $? -ne 0 ]; then
    echo "Docker image push failed."
    exit 1
fi

endTime=$(date +%s)
totalTime=$((endTime - startTime))

hours=$((totalTime / 3600))
minutes=$(( (totalTime % 3600) / 60))
seconds=$((totalTime % 60))

echo "Docker image pushed successfully."
echo "Total deploy time: ${hours} hours, ${minutes} minutes, ${seconds} seconds"
