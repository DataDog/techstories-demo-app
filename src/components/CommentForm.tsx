import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";
import { api } from "~/utils/api";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface CommentFormProps {
  postId: string;
  slug: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({ postId, slug }) => {
  const [commentBody, setCommentBody] = useState<string | undefined>("");
  const context = api.useContext();
  const mutation = api.comment.createComment.useMutation({
    async onSuccess() {
      await Promise.all([
        context.post.getPostBySlug.invalidate({ slug }),
        context.comment.getCommentsByPostId.invalidate({ postId }),
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!commentBody) {
      return;
    }

    mutation.mutate({ postId, content: commentBody });
    setCommentBody("");
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className=" text-xl font-bold">Leave a comment</h2>
      <form className="flex flex-col gap-2" role="form" onSubmit={handleSubmit}>
        <MDEditor
          value={commentBody}
          onChange={setCommentBody}
          preview="edit"
          hideToolbar={false}
          commands={[]}
          textareaProps={{
            placeholder: "Write your comment's content using Markdown.",
          }}
        />
        <button
          className="w-full rounded-md border border-gray-300 p-2"
          type="submit"
          disabled={mutation.isLoading}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CommentForm;
