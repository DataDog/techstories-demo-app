import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

export const usePostVote = (postId: string, slug?: string) => {
  const { data: sessionData } = useSession();
  const canVote = !!sessionData;

  const { data: hasVoted } = sessionData
    ? api.post.hasVoted.useQuery({ postId })
    : { data: 0 };

  const context = api.useContext();

  const addVote = api.post.addVote.useMutation({
    async onSuccess() {
      await context.post.getPosts.invalidate();
      await context.post.hasVoted.invalidate({ postId });
      slug && (await context.post.getPostBySlug.invalidate({ slug }));
    },
  });
  const removeVote = api.post.removeVote.useMutation({
    async onSuccess() {
      await context.post.getPosts.invalidate();
      await context.post.hasVoted.invalidate({ postId });
      slug && (await context.post.getPostBySlug.invalidate({ slug }));
    },
  });

  const handleVote = () => {
    if (!sessionData) {
      return;
    }

    if (hasVoted) {
      removeVote.mutate({ postId });
    } else {
      addVote.mutate({ postId });
    }
  };

  return { handleVote, hasVoted, canVote };
};
