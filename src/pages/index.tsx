import type { NextPage } from "next";
import MainLayout from "~/layouts/MainLayout";
import PostList from "~/components/PostList";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data: posts } = api.post.getPosts.useQuery();

  return (
    <MainLayout pageTitle="Home" description="Home page">
      <p className="w-100 bg-neutral-200 p-4 text-center">
        Welcome to TechStories, new social network for friends write their own
        stories about technology. Log in to create, comment, and vote on
        stories. This site is in private beta, so no new signups are being
        accepted at this time. However, you can still log in with the demo
        account below.
        <br />
        <br />
        <strong>Username:</strong> <code>alice.smith@example.com</code>
        <br />
        <strong>Password:</strong> <code>redRose456</code>
      </p>

      {posts ? <PostList posts={posts} /> : "Loading..."}
    </MainLayout>
  );
};

export default Home;
