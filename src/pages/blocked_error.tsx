import type { NextPage } from "next";
import MainLayout from "~/layouts/MainLayout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  return (
    <MainLayout pageTitle="Access Blocked" description="Access Blocked">
      <p className="w-100 bg-neutral-200 p-4 text-center text-2xl font-bold">
        🚷 You no longer have access to TechStories 🚷 
      </p>
      <p className="w-100 bg-neutral-200 p-4 text-center">
        Contact us at techstories@example.com with any questions.
      </p>
    </MainLayout>
  );
};

export default Home;
