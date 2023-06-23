import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export const NewPostForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string | undefined>("");
  const router = useRouter();

  const mutation = api.post.createPost.useMutation({
    async onSuccess(_, { slug }) {
      await router.push(`/posts/${slug}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !content) {
      return;
    }

    const slug = title.toLowerCase().replace(/ /g, "-");

    mutation.mutate({ title, content, slug });
    setTitle("");
    setContent("");
  };

  return (
    <form className="flex flex-col space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <label
          htmlFor="title"
          className="block text-sm font-medium leading-6 text-neutral-900"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className="block w-full rounded-md border-0 py-1.5 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="content"
          className="block text-sm font-medium leading-6 text-neutral-900"
        >
          Content
        </label>
        <MDEditor
          value={content}
          onChange={setContent}
          preview="edit"
          hideToolbar={false}
          commands={[]}
          textareaProps={{
            placeholder: "Write your post's content using Markdown.",
          }}
        />
      </div>

      <button
        type="submit"
        className="flex w-full justify-center rounded-md bg-neutral-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Submit
      </button>
    </form>
  );
};

export default NewPostForm;
