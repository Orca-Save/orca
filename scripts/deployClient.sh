#!/bin/bash
# Optional production flag, e.g., --prod (currently not used)
if [[ "$1" == "--prod" ]]; then
    PROD=true
fi

echo "Logging in to Docker Hub..."
docker login
if [ $? -ne 0 ]; then
    echo "Docker login failed." >&2
    exit $?
fi

dockerfile="Dockerfile.client"
dockerHubRepository="reharly20/orca-staging"
dockerTag="latest"

startTime=$(date +%s)

echo "Building Docker image using \$dockerfile... \$dockerHubRepository:\$dockerTag"
docker build -f "$dockerfile" -t "${dockerHubRepository}:${dockerTag}" .
if [ $? -ne 0 ]; then
    echo "Docker image build failed." >&2
    exit $?
fi

echo "Pushing Docker image to Docker Hub..."
docker push "${dockerHubRepository}:${dockerTag}"
if [ $? -ne 0 ]; then
    echo "Docker image push failed." >&2
    exit $?
fi

endTime=$(date +%s)
totalTime=$(( endTime - startTime ))
hours=$(( totalTime / 3600 ))
minutes=$(( (totalTime % 3600) / 60 ))
seconds=$(( totalTime % 60 ))

echo "Docker image pushed and webhook triggered successfully."
echo "Total deploy time: ${hours} hours, ${minutes} minutes, ${seconds} seconds"
