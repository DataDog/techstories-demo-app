import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { PostList } from "~/components/PostList";

const mockPosts = [
  {
    id: "1",
    title: "First Post",
    slug: "first-post",
    author: { name: "Alice" },
    createdAt: new Date(),
    _count: { votes: 2, comments: 1 },
    content: "Hello world",
  },
  {
    id: "2",
    title: "Second Post",
    slug: "second-post",
    author: { name: "Bob" },
    createdAt: new Date(),
    _count: { votes: 3, comments: 2 },
    content: "Another post",
  },
];

describe("PostList", () => {
  test("renders a list of posts", () => {
    render(<PostList posts={mockPosts as any} />);
    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });

  test("renders empty state", () => {
    render(<PostList posts={[]} />);
    expect(screen.getByText(/no posts found/i)).toBeInTheDocument();
  });

  test("flaky: sometimes simulates a slow load that causes a timeout", async () => {
    const shouldTimeout = Math.random() > 0.5;
    if (shouldTimeout) {
      // Simulate a slow render (never renders posts)
      render(<div>Loading...</div>);
      await expect(
        waitFor(
          () => expect(screen.getByText("First Post")).toBeInTheDocument(),
          { timeout: 100 }
        )
      ).rejects.toThrow();
    } else {
      render(<PostList posts={mockPosts as any} />);
      await waitFor(() =>
        expect(screen.getByText("First Post")).toBeInTheDocument()
      );
    }
  });

  // Intentionally incorrect test: will always fail
  test("always fails: expects a post that does not exist", () => {
    render(<PostList posts={mockPosts as any} />);
    expect(screen.getByText("This post does not exist")).toBeInTheDocument();
    // To fix this test, change the expected text to one that actually exists:
    // expect(screen.getByText('First Post')).toBeInTheDocument();
  });
});
