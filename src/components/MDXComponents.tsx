import type { HTMLAttributes } from "react";

type MDXProps = HTMLAttributes<HTMLElement>;

export const MDXComponents = {
  a: (props: MDXProps) => <a {...props} className="text-blue-500 hover:underline" />,
  h1: (props: MDXProps) => <h1 {...props} className="mb-2 text-3xl font-bold" />,
  h2: (props: MDXProps) => <h2 {...props} className="mb-2 text-2xl font-bold" />,
  h3: (props: MDXProps) => <h3 {...props} className="mb-2 text-xl font-bold" />,
  h4: (props: MDXProps) => <h4 {...props} className="mb-2 text-lg font-bold" />,
  h5: (props: MDXProps) => <h5 {...props} className="mb-2 text-base font-bold" />,
  h6: (props: MDXProps) => <h6 {...props} className="mb-2 text-base font-bold" />,
  p: (props: MDXProps) => <p {...props} className="mb-2 text-base leading-relaxed" />,
  ul: (props: MDXProps) => <ul {...props} className="my-2 list-inside list-disc" />,
  ol: (props: MDXProps) => <ol {...props} className="list-inside list-decimal" />,
  li: (props: MDXProps) => <li {...props} className="text-normal leading-relaxed" />,
  blockquote: (props: MDXProps) => (
    <blockquote
      {...props}
      className="border-l-4 border-neutral-500 pl-4 italic"
    />
  ),
  hr: (props: MDXProps) => <hr {...props} className="border-neutral-500" />,
  table: (props: MDXProps) => (
    <table {...props} className="table-auto border-collapse" />
  ),
  th: (props: MDXProps) => (
    <th {...props} className="border border-neutral-500 px-4 py-2" />
  ),
  td: (props: MDXProps) => (
    <td {...props} className="border border-neutral-500 px-4 py-2" />
  ),
  inlineCode: (props: MDXProps) => (
    <code {...props} className="rounded bg-neutral-200 px-1" />
  ),
  pre: (props: MDXProps) => <pre {...props} className="rounded bg-neutral-200 p-2" />,
};

export default MDXComponents;
