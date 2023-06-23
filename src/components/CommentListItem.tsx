import type { CommentListItemProps } from "~/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCommentVote } from "~/hooks/useCommentVote";
import VoteButton from "./VoteButton";

export const CommentListItem: React.FC<CommentListItemProps> = ({
  comment,
}) => {
  const { handleVote, hasVoted, canVote } = useCommentVote(comment.id);
  const { content } = comment;

  return (
    <li className="flex items-center gap-6 border-b border-dotted border-neutral-600 px-2 py-3 last-of-type:border-b-0">
      <div className="flex min-w-[15%] flex-col items-center justify-center gap-1 px-3 md:min-w-[10%]">
        <VoteButton
          onClick={handleVote}
          voteType={hasVoted ? "remove" : "add"}
          disabled={!canVote && true}
        />
        <div className="bg-neutral-600 px-2 py-1 text-2xl text-neutral-50">
          {comment._count.votes}
        </div>
      </div>
      <div>
        <div>
          <div className="text-neutral-500">
            By {comment.author.name} on {comment.createdAt.toDateString()}
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose">
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </li>
  );
};

export default CommentListItem;
