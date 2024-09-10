import type { NextPage } from "next";
import MainLayout from "~/layouts/MainLayout";
import PostList from "~/components/PostList";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data: posts } = api.post.getPosts.useQuery();

  return (
    <MainLayout pageTitle="Home" description="Home page">
      <p className="w-100 bg-neutral-200 p-4 text-center">
        Welcome to TechStories, the new social network where friends write their own
        stories about technology. Log in to create, comment, and vote on
        stories. 
      </p>

      {posts ? <PostList posts={posts} /> : "Loading..."}
    </MainLayout>
  );
};

export default Home;
