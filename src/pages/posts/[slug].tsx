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
    isPending,
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
      <div className="mb-10 flex w-full flex-col gap-12">
        <div className="flex flex-col gap-2">
          {isPending && <Loading />}
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
