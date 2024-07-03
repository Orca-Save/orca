$resourceGroupName = "orca-staging_group-a34c"
$webAppName = "orca-staging"
$tunnel = az webapp create-remote-connection --resource-group $resourceGroupName --name $webAppName
$tunnelInfo = $tunnel | ConvertFrom-Json
$localPort = $tunnelInfo.tunnelPort
# az webapp start --resource-group $resourceGroupName --name $webAppName

ssh -p $localPort root@127.0.0.1
