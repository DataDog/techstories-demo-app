import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import MainLayout from "~/layouts/MainLayout";
import SinglePost from "~/components/SinglePost";
import { api } from "~/utils/api";

const Loading: React.FC = () => {
  return <h2 className="text-center text-3xl font-bold">Loading...</h2>;
};

const Error: React.FC<{ error: string }> = ({ error }) => {
  return (
    <>
      <h2 className="text-center text-3xl font-bold">Error</h2>
      <p className="text-xl">{error}</p>
    </>
  );
};

const Post: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const {
    data: post,
    isError,
    isLoading,
    error,
  } = api.post.getPostBySlug.useQuery(
    {
      slug: slug as string,
    },
    {
      enabled: router.isReady,
    }
  );

  return (
    <MainLayout
      pageTitle={post?.title || ""}
      description="Your place for the bits."
    >
      <div className="container mx-auto mb-10 flex max-w-4xl flex-col gap-12 p-3 px-4">
        <div className="flex flex-col gap-2">
          {isLoading && <Loading />}
          {isError && <Error error={error.message} />}
          {post && <SinglePost post={post} />}
        </div>
        <div>
          <Link href="/">Back to Home</Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Post;
