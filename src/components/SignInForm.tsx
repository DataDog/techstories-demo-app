import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    const callbackUrl = (router.query.callbackUrl as string) || "/";

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(true);
        return;
      }

      await router.push(callbackUrl);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <form
      className="space-y-6"
      role="form"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <h2 className="text-center text-4xl">Sign In</h2>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-red-400"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Your email or password is incorrect.
              </h3>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col">
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-neutral-900"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="alice.smith@example.com"
          className="block w-full rounded-md border-0 py-1.5 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-neutral-900"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="block w-full rounded-md border-0 py-1.5 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={password}
          autoComplete="current-password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="flex w-full justify-center rounded-md bg-neutral-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Sign in
      </button>
      <p className="mt-4 text-center text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default SignInForm;
