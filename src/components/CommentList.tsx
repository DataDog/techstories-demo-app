import { api } from "~/utils/api";
import CommentListItem from "~/components/CommentListItem";

export const CommentList: React.FC<{ postId: string }> = ({ postId }) => {
  const { data: comments } = api.comment.getCommentsByPostId.useQuery({
    postId,
  });

  return (
    <ul className="divide-y divide-neutral-600">
      {comments
        ? comments.map((comment) => (
            <CommentListItem key={comment.id} comment={comment} />
          ))
        : "Loading..."}
    </ul>
  );
};

export default CommentList;
