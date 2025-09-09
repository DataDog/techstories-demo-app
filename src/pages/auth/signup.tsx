import MainLayout from "~/layouts/MainLayout";
import { SignUpForm } from "~/components/SignUpForm";

export const SignUp = () => {
  return (
    <MainLayout pageTitle="Sign Up" description="Create a new account">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <SignUpForm />
      </div>
    </MainLayout>
  );
};

export default SignUp;
