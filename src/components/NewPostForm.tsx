import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react"; //

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export const NewPostForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string | undefined>("");
  const router = useRouter();

  const { data: session } = useSession();
  console.log(session);

  const mutation = api.post.createPost.useMutation({
    async onSuccess(_, { slug }) {
      await router.push(`/posts/${slug}`);
    },
  });

  const generatePost = async () => {
    
    // Fetch generated post content from expensive third-party API
    // Send user ID from session in request body
    const URL = process.env.NEXT_GENERATE_POST_API_URL
        ? `${process.env.NEXT_GENERATE_POST_API_URL}/generate_post`
        : "http://localhost:3002/generate_post";
    try {
      const response = await fetch(URL, {
        method: "POST",  // Assuming it's a POST request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session?.user?.id,
          userName: session?.user?.name,
          userEmail: session?.user?.email,  
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate post content');
    }
    const generatedPost = await response.json();

    // Add generated post content to form
    setTitle(generatedPost.post.title);
    setContent(generatedPost.post.content);
  } catch (error) {
    console.error('Failed to generate post content', error);
  }
};

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

      {/* Generate Post Button */}
      <button
        type="button"
        onClick={generatePost}
        className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Generate Post Content using AI
      </button>

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
