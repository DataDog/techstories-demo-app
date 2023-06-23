import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

export const useCommentVote = (commentId: string) => {
  const { data: sessionData } = useSession();
  const canVote = !!sessionData;

  const { data: hasVoted } = api.comment.hasVoted.useQuery({ commentId });
  const context = api.useContext();

  const addVote = api.comment.addVote.useMutation({
    async onSuccess() {
      await context.comment.getCommentsByPostId.invalidate();
      await context.comment.hasVoted.invalidate({ commentId });
    },
  });

  const removeVote = api.comment.removeVote.useMutation({
    async onSuccess() {
      await context.comment.getCommentsByPostId.invalidate();
      await context.comment.hasVoted.invalidate({ commentId });
    },
  });

  const handleVote = () => {
    if (!sessionData) {
      return;
    }

    if (hasVoted) {
      removeVote.mutate({ commentId });
    } else {
      addVote.mutate({ commentId });
    }
  };

  return { handleVote, hasVoted, canVote };
};
