import type { PostListProps } from "~/types";
import PostListItem from "~/components/PostListItem";

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <>
      {posts?.length ? (
        <ul className="w-100 flex flex-col">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </ul>
      ) : (
        "No posts found"
      )}
    </>
  );
};

export default PostList;
