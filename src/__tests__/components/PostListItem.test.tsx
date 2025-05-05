import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PostListItem } from "~/components/PostListItem";

const mockPost = {
  id: "1",
  title: "Test Post",
  slug: "test-post",
  author: { name: "Alice" },
  createdAt: new Date(),
  _count: { votes: 5, comments: 2 },
  content: "Test content",
};

describe("PostListItem", () => {
  test("renders post title", () => {
    render(<PostListItem post={mockPost as any} />);
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  test("renders vote count", () => {
    render(<PostListItem post={mockPost as any} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("flaky: sometimes author is missing", () => {
    const shouldOmitAuthor = Math.random() > 0.5;
    const post = shouldOmitAuthor
      ? { ...mockPost, author: undefined }
      : mockPost;
    render(<PostListItem post={post as any} />);
    if (shouldOmitAuthor) {
      expect(screen.queryByText(/By/)).not.toBeInTheDocument();
    } else {
      expect(screen.getByText(/By Alice on/)).toBeInTheDocument();
    }
  });

  // Intentionally incorrect test: will always fail
  test("always fails: expects a post author that does not exist", () => {
    render(<PostListItem post={mockPost as any} />);
    expect(screen.getByText("By NotARealAuthor on")).toBeInTheDocument();
  });
});
