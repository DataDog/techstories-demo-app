import MainLayout from "~/layouts/MainLayout";
import SignInForm from "~/components/SignInForm";

export const SignIn = () => {
  return (
    <MainLayout pageTitle="Sign In" description="Sign in to your account">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <SignInForm />
      </div>
    </MainLayout>
  );
};

export default SignIn;
