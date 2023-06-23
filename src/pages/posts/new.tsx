import type { NextPage } from "next";
import Link from "next/link";
import MainLayout from "~/layouts/MainLayout";
import NewPostForm from "~/components/NewPostForm";

export const NewPost: NextPage = () => {
  return (
    <MainLayout pageTitle="New Post" description="Create a new post">
      <div className="flex flex-col">
        <div className="mb-3 border-b pb-3">
          <h2 className="text-2xl font-semibold leading-6 text-neutral-900">
            Create a new post
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-neutral-800">
            Let people know what you're thinking.
          </p>
        </div>
        <NewPostForm />
        <hr className="my-4" />

        <Link href="/" className="text-xl underline">
          Go back to home
        </Link>
      </div>
    </MainLayout>
  );
};

export default NewPost;
