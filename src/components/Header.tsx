import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from 'next/router';

export const Header: React.FC = () => {
  return (
    <header className="mx-auto flex w-full items-center justify-center">
      <div className="container flex flex-col items-center justify-between  py-6 md:flex-row">
        <Link
          href="/"
          className="border-2 border-black bg-black px-2 py-1 text-6xl  text-white "
        >
          TechStories
        </Link>
        <Auth />
      </div>
    </header>
  );
};

const Auth: React.FC = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const REFERRAL_URL = process.env.NEXT_PUBLIC_REFERRAL_SERVICE_URL
      ? `${process.env.NEXT_PUBLIC_REFERRAL_SERVICE_URL}/refer_friends`
      : "http://127.0.0.1:3003/refer_friends";

  return (
    <div className="my-2 flex flex-wrap items-center gap-4 md:my-0 md:flex-row">
      <p>{sessionData && <span>Hi, {sessionData.user?.name}!</span>}</p>
      <Link
        href="/posts/new"
        className="bg-neutral-300 px-2 py-1 underline transition-all hover:bg-neutral-400"
      >
        {" "}
        + New Post
      </Link>
      <button
        className="border border-black px-2 py-1 underline transition-all hover:bg-neutral-400"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
      {sessionData && (
              <a
                href={`${REFERRAL_URL}?email=${encodeURIComponent(sessionData.user.email ?? '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-black px-2 py-1 underline transition-all hover:bg-neutral-400"
              >
                Refer a Friend
              </a>
            )}
      {!sessionData && ( 
              <button
                className="border border-black px-2 py-1 underline transition-all hover:bg-neutral-400"
                onClick={() => router.push('/auth/signup')}
              >
                Create Account
              </button>
            )}
    </div>
  );
};
