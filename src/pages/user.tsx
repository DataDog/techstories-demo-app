import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import MainLayout from "~/layouts/MainLayout";
import PostListItem from "~/components/PostListItem";
import { api } from "~/utils/api";

const ProfileSection: React.FC<{ user: any }> = ({ user }) => {
  return (
    <section className="flex flex-col gap-2 bg-neutral-200 p-3">
      <h2 className="text-4xl font-bold">Profile</h2>
      <p>
        <strong>Username:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
    </section>
  );
};

const User: NextPage = () => {
  const { data: sessionData } = useSession();
  const userData = api.user.getUserById.useQuery({
    id: sessionData?.user.id,
  });

  const renderTopPosts = (posts: any) => {
    const PostList = [];
    for (let i = 0; i < 3; i++) {
      PostList.push(<PostListItem key={posts[i].id} post={posts[i]} />);
    }

    return PostList;
  };

  return (
    <MainLayout pageTitle="Home" description="Home page">
      {/* build out profile based on user */}
      {userData && <ProfileSection user={sessionData?.user} />}
      {/* posts */}
      <section className="my-2 flex flex-col gap-2">
        <h2 className="text-3xl font-bold">Top 3 Posts</h2>
        <ul className="w-100 flex flex-col">
          {userData && userData.data?.posts?.length
            ? renderTopPosts(userData.data.posts)
            : "No posts found"}
        </ul>
      </section>
    </MainLayout>
  );
};

export default dynamic(() => Promise.resolve(User), { ssr: false });
