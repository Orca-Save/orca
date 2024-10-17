# Set the Tenant ID
$tenantId = "06187e97-276e-4e2e-b8c0-494f51cbad65"

# Authenticate to Azure with the specified tenant
Connect-AzAccount -TenantId $tenantId

# Get the access token
$token = (Get-AzAccessToken -TenantId $tenantId -ResourceUrl "https://graph.microsoft.com/").Token

# Set the API endpoint and headers
$uri = "https://graph.microsoft.com/beta/users?`$top=999"
$headers = @{
    Authorization = "Bearer $token"
}

# Initialize an array to hold user data
$allUsers = @()

# Make the REST API call
do {
    $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
    $allUsers += $response.value
    $uri = $response."@odata.nextLink"
} while ($uri)

# Function to extract the email address from identities
function Get-EmailAddressFromIdentities($identities) {
    foreach ($identity in $identities) {
        if ($identity.signInType -eq "emailAddress") {
            return $identity.issuerAssignedId
        }
    }
    return $null
}

# Extract relevant fields into a more usable form
$processedUsers = $allUsers | ForEach-Object {
    [PSCustomObject]@{
        Id                = $_.id
        DisplayName       = $_.displayName
        UserPrincipalName = $_.userPrincipalName
        EmailAddress      = Get-EmailAddressFromIdentities($_.identities)
        CreatedDateTime   = $_.createdDateTime
    }
}

# Define the output CSV file path
$outputCsvPath = "B2CUsers.csv"

# Export the data to CSV
$processedUsers | Export-Csv -Path $outputCsvPath -NoTypeInformation

Write-Output "User data exported to: $outputCsvPath"
