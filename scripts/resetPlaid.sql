delete
	FROM public."Account";
delete
	FROM public."Transaction";
delete
	FROM public."PlaidItem";

UPDATE "UserProfile"
SET "stripeCustomerId" = NULL,  "stripeSubscriptionId" = NULL, "privacyPolicyAccepted" = false, "googlePaySubscriptionToken" = NULL;