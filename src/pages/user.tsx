import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import MainLayout from "~/layouts/MainLayout";
import PostList from "~/components/PostList";
import { api } from "~/utils/api";

const User: NextPage = () => {
  const { data: sessionData } = useSession();
  const { data: posts } = api.post.getPosts.useQuery();

  const renderUserData = () => {
    for (let i = 0; i < posts.length; i++) {
      return (
        <div>
          <p>Username: {sessionData.user.name}</p>
          <p>Email: {sessionData.user.email}</p>
          <p>Number of posts: {posts.length}</p>
        </div>
      );
    }
  };

  return (
    <MainLayout pageTitle="Home" description="Home page">
      {posts && renderUserData()}
    </MainLayout>
  );
};

export default User;
