Connect-AzureAD 

$users = Get-AzureADUser -All $true
$userData = foreach ($user in $users) {
    $UserName = if ($user.SignInNames.Value -contains $null) {
        $user.UserPrincipalName
    } else {
        $user.SignInNames.Value
    }
    $userProperties = [ordered]@{
        userPrincipalName = $user.UserPrincipalName
        UserName = $UserName
        displayName = $user.DisplayName
        surname = $user.Surname
        mail = $user.Mail
        givenName = $user.GivenName
        objectId = $user.ObjectId
        userType = $user.UserType
        jobTitle = $user.JobTitle
        department = $user.Department
        accountEnabled = $user.AccountEnabled
        usageLocation = $user.UsageLocation
        streetAddress = $user.StreetAddress
        state = $user.State
        country = $user.Country
        physicalDeliveryOfficeName = $user.PhysicalDeliveryOfficeName
        city = $user.City
        postalCode = $user.PostalCode
        telephoneNumber = $user.TelephoneNumber
        mobile = $user.Mobile
        authenticationPhoneNumber = $user.AuthenticationPhoneNumber
        authenticationAlternativePhoneNumber = $user.AuthenticationAlternativePhoneNumber
        authenticationEmail = $user.AuthenticationEmail
        alternateEmailAddress = $user.AlternateEmailAddress
        ageGroup = $user.AgeGroup
        consentProvidedForMinor = $user.ConsentProvidedForMinor
        legalAgeGroupClassification = $user.LegalAgeGroupClassification
        
    }
    New-Object -TypeName PSObject -Property $userProperties
}

$userData | Export-Csv -Path ".\Test.csv" -NoTypeInformation