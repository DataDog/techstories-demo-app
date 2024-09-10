import MainLayout from "~/layouts/MainLayout";
import SignupForm from '../../components/SignUpForm';

export const SignUp = () => {
  return (
    <MainLayout pageTitle="Sign In" description="Sign in to your account">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <SignupForm />
      </div>
    </MainLayout>
  );
};

export default SignUp;