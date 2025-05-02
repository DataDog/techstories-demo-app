import MainLayout from "~/layouts/MainLayout";
import ReferralForm from "~/components/ReferralForm";

export default function ReferralsPage() {
  return (
    <MainLayout pageTitle="Refer a friend" description="TechStories referral program">
      <ReferralForm />
    </MainLayout>
  );
};
