export const MDXComponents = {
  a: (props) => <a {...props} className="text-blue-500 hover:underline" />,
  h1: (props) => <h1 {...props} className="mb-2 text-3xl font-bold" />,
  h2: (props) => <h2 {...props} className="mb-2 text-2xl font-bold" />,
  h3: (props) => <h3 {...props} className="mb-2 text-xl font-bold" />,
  h4: (props) => <h4 {...props} className="mb-2 text-lg font-bold" />,
  h5: (props) => <h5 {...props} className="mb-2 text-base font-bold" />,
  h6: (props) => <h6 {...props} className="mb-2 text-base font-bold" />,
  p: (props) => <p {...props} className="mb-2 text-base leading-relaxed" />,
  ul: (props) => <ul {...props} className="my-2 list-inside list-disc" />,
  ol: (props) => <ol {...props} className="list-inside list-decimal" />,
  li: (props) => <li {...props} className="text-normal leading-relaxed" />,
  blockquote: (props) => (
    <blockquote
      {...props}
      className="border-l-4 border-neutral-500 pl-4 italic"
    />
  ),
  hr: (props) => <hr {...props} className="border-neutral-500" />,
  table: (props) => <table {...props} className="table-auto border-collapse" />,
  th: (props) => (
    <th {...props} className="border border-neutral-500 px-4 py-2" />
  ),
  td: (props) => (
    <td {...props} className="border border-neutral-500 px-4 py-2" />
  ),
  inlineCode: (props) => (
    <code {...props} className="rounded bg-neutral-200 px-1" />
  ),
  pre: (props) => <pre {...props} className="rounded bg-neutral-200 p-2" />,
};

export default MDXComponents;
