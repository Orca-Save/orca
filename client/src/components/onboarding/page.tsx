import OnboardingForm from './_components/OnboardingForm';

export default function OnboardingPage() {
  const [linkToken, userProfile, linkedItems, onboardingProfile] =
    await Promise.all([
      createLinkToken(session.user.id),
      getUserProfile(session.user.id),
      getAllLinkedItems(session.user.id),
      getOnboardingProfile(session.user.id),
    ]);
  return (
    <OnboardingForm
      linkToken={linkToken.link_token}
      userProfile={userProfile}
      itemsData={linkedItems}
      onboardingProfile={onboardingProfile}
    />
  );
}
