import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const Header: React.FC = () => {
  return (
    <header className="mx-auto flex w-full items-center justify-center">
      <div className="container flex flex-col items-center justify-between  py-6 md:flex-row">
        <Link
          href="/"
          className="logo border-2 border-black bg-black px-2 py-1 text-6xl text-white"
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
  return (
    <nav className="my-2 flex flex-wrap items-center gap-4 md:my-0 md:flex-row">
      <span>{sessionData && <span>Hi, {sessionData.user.name}!</span>}</span>
      <Link
        href="/posts/new"
        className="new-btn bg-neutral-300 px-2 py-1 underline transition-all hover:bg-neutral-400"
      >
        {" "}
        + New Post
      </Link>
      <Link
        href="/user"
        className="user-btn bg-neutral-300 px-2 py-1 underline transition-all hover:bg-neutral-400"
      >
        {" "}
        User
      </Link>
      <button
        className="auth-btn border border-black px-2 py-1 underline transition-all hover:bg-neutral-400"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </nav>
  );
};
