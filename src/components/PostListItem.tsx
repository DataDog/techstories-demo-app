import type { PostListItemProps } from "~/types";
import Link from "next/link";
import { usePostVote } from "~/hooks/usePostVote";
import VoteButton from "./VoteButton";

export const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  const { handleVote, hasVoted, canVote } = usePostVote(post.id);

  return (
    <li className="postitem flex items-center gap-6 border-b border-dotted border-neutral-600 px-2 py-3 last-of-type:border-b-0">
      <div className="postitem__vote-container flex min-w-[15%] flex-col items-center justify-center gap-1 px-3 md:min-w-[10%]">
        <VoteButton
          onClick={handleVote}
          voteType={hasVoted ? "remove" : "add"}
          disabled={!canVote && true}
        />
        <div className="postitem__vote-count bg-neutral-600 px-2 py-1 text-2xl text-neutral-50">
          {post._count.votes}
        </div>
      </div>
      <div className="postitem__content-container">
        <div className="postitem__title">
          <Link
            href={`/posts/${post.slug}`}
            className="postitem__title-link text-xl"
          >
            {post.title}
          </Link>
        </div>
        <div className="postitem__content">
          <div className="postitem__meta text-neutral-500">
            By {post.author.name} on {post.createdAt.toDateString()}
          </div>
          <div className="postitem__comment text-neutral-500">
            {post._count.comments} comments
          </div>
        </div>
      </div>
    </li>
  );
};

export default PostListItem;
