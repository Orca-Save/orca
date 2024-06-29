param(
    [switch]$dev
)

Write-Host "Logging in to Docker Hub..."
docker login
$dockerHubRepository = "reharly20/orca"
$dockerTag = "latest"

$dockerfile = "Dockerfile"
if ($dev) {
    $dockerfile = "Dockerfile.dev"
    $dockerHubRepository = "reharly20/orca-staging"
    $dockerTag = "staging"
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker login failed."
    exit $LASTEXITCODE
}

$startTime = Get-Date

Write-Host "Building Docker image using $dockerfile... $dockerHubRepository : $dockerTag"
docker build -f $dockerfile -t "${dockerHubRepository}:$dockerTag" .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker image build failed."
    exit $LASTEXITCODE
}

Write-Host "Pushing Docker image to Docker Hub..."
docker push "${dockerHubRepository}:$dockerTag"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker image push failed."
    exit $LASTEXITCODE
}

$endTime = Get-Date
$totalTime = $endTime - $startTime

Write-Host "Docker image pushed and webhook triggered successfully."
Write-Host "Total deploy time: $($totalTime.Hours) hours, $($totalTime.Minutes) minutes, $($totalTime.Seconds) seconds"
